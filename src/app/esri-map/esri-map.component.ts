import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { loadModules } from 'esri-loader';
import { Widget } from './esri-widget.class';
import ConnectionPoints from './layers/conection-points.data.json';
import Buildings from './layers/Chisinau_buildings.json';

let EsriMap: any;
let EsriMapView: any;
let Expand: any;
let BasemapGallery: any;
let Search: any;
let GraphicsLayer: any;
let Graphic: any;
let PopupTemplate: any;
let Point: any;
let webMercatorUtils: any;
let FeatureLayer: any;
let Polygon: any;
let Polyline: any;

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {

  @ViewChild('mapViewNode')
  private mapViewEl: ElementRef;
  private conectionPointsLayer: any;
  private buildingsLayer: any;
  private map: any;
  private mapView: any;
  private selectedGraphicLayer: any;

  constructor() { }

  async setGraphicToCBuildingsLayer() {
    try {

      let renderer = {
        type: "simple",  // autocasts as new SimpleRenderer()
        symbol: {
          type: "simple-fill",  // autocasts as new SimpleFillSymbol()
          color: [ 255, 128, 0, 0.5 ],
          outline: {  // autocasts as new SimpleLineSymbol()
            width: 1,
            color: "black"
          }
        }
      };

      this.buildingsLayer = new FeatureLayer({
        source: Buildings,
        objectIdField: "FID",
        renderer: renderer,
        geometryType: 'polygon',
      });

    } catch (error) {
      console.log(`Map::setGraphicToCBuildingsLayer error from esri-map.component.ts: ${error}`);
    }
  }

  async setGraphicToConectionPointsLayer(  ) {
    try {
      let features = [];

      for (let objId = 0; objId < ConnectionPoints.length; objId++) {
        const element = ConnectionPoints[objId];
        features.push({
          geometry: {
            type: "point",
            x: webMercatorUtils.xyToLngLat( element.x, element.y )[0],
            y: webMercatorUtils.xyToLngLat( element.x, element.y )[1],
          },
          attributes: {
            ObjectID: objId,
          }
        });
      }

      let diamondSymbol = {
        type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
        style: "circle",
        color: [ 255, 128, 45 ],  // autocasts as new Color()
        outline: {              // autocasts as new SimpleLineSymbol()
          color: [ 0, 0, 0 ] // Again, no need for specifying new Color()
        }
      };
    

      let popupTemplate = {
        title: "Connection Point",
        content: "{ObjectID}",
      }; 

      this.conectionPointsLayer = new FeatureLayer({
        source: features,
        objectIdField: "ObjectID",
        renderer: {
          type: "simple",  // autocasts as new SimpleRenderer()
          symbol: diamondSymbol,
        },
        geometryType: 'point',
        popupTemplate: popupTemplate,
      });

    } catch (error) {
      console.log(`Map::setGraphicToConectionPointsLayer error from esri-map.component.ts: ${error}`);
    }
  }

  async init() {
    try {
      // Load modules from loadModules Promise
      [EsriMap] = await loadModules(['esri/Map']);
      [EsriMapView] = await loadModules(['esri/views/MapView']);
      [Expand] = await loadModules(['esri/widgets/Expand']);
      [BasemapGallery] = await loadModules(['esri/widgets/BasemapGallery']);
      [Search] = await loadModules(['esri/widgets/Search']);
      // [GraphicsLayer] = await loadModules(['esri/layers/GraphicsLayer']);
      [Graphic] = await loadModules(['esri/Graphic']);
      [PopupTemplate] = await loadModules(['esri/PopupTemplate']);
      [Point] = await loadModules(['esri/geometry/Point']);
      [webMercatorUtils] = await loadModules(['esri/geometry/support/webMercatorUtils']);
      [FeatureLayer] = await loadModules(['esri/layers/FeatureLayer']);
      [Polygon] = await loadModules(['esri/geometry/Polygon']);
      [Polyline] = await loadModules(['esri/geometry/Polyline']);

    } catch (error) {
      console.log(`Map::init error from esri-map.component.ts: ${error}`);
    }
  }

  async selectBuilding( feature ) {
    let selectedGraphic = new Graphic({
      geometry: feature.geometry,
      attributes: feature.attributes,
      symbol: {
        type: "simple-fill",  // autocasts as new SimpleFillSymbol()
        color: [ 255, 128, 0, 0.5 ],
        outline: {  // autocasts as new SimpleLineSymbol()
          width: 1,
          color: "black"
        }
      }
    });

    let selectedAsPoligon = new Polygon( feature.geometry );

    let centroid = new Graphic({
      geometry: selectedAsPoligon.centroid,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: [226, 119, 40],
        outline: { // autocasts as new SimpleLineSymbol()
          color: [0, 0, 255],
          width: 2
        }
      },
    });

    this.mapView.graphics.add( selectedGraphic );
    this.mapView.graphics.add( centroid );

    return selectedAsPoligon.centroid;
  }


  async drowLine( firstPoint: any, secondPoint: any ) {

    let paths = [
        [ webMercatorUtils.xyToLngLat( firstPoint.x, firstPoint.y )[0], webMercatorUtils.xyToLngLat( firstPoint.x, firstPoint.y )[1] ],
        [ webMercatorUtils.xyToLngLat( secondPoint.x, secondPoint.y )[0], webMercatorUtils.xyToLngLat( secondPoint.x, secondPoint.y )[1] ],
      ];

    var line = new Polyline({
      paths: paths,
    });
    let lineSymbol = {
        type: "simple-line",
        style: "short-dash",
        width: 1.75,
        color: [255, 0, 0, 1]
    };

    let graphic = new Graphic({
      geometry: line,
      symbol: lineSymbol,
    });
    this.mapView.graphics.add( graphic );
    return graphic;

  }

  async selectPoint( point ) {
    let graphic = new Graphic({
      geometry: point.geometry,
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: [226, 119, 40],
        outline: { // autocasts as new SimpleLineSymbol()
          color: [0, 255, 0],
          width: 2
        }
      },
    });

    this.mapView.graphics.add( graphic );

    return graphic;
  }

  async getClosestConnectionPoint( centroid ) {
    try {
      let closestConnectionPoint: any;
      let diamentru = 0;
  
      while( !closestConnectionPoint ) {
        diamentru += 10;
  
        let query = this.conectionPointsLayer.createQuery();
        query.geometry = centroid;
        query.distance = diamentru;
        
        let closestConnectionPointSet = await this.conectionPointsLayer.queryFeatures( query );
        closestConnectionPoint = closestConnectionPointSet.features[0];
  
      }

      return closestConnectionPoint;  

    } catch (error) {
      console.log(`Map::getClosestConnectionPoint error from esri-map.component.ts: ${error}`);
    }
  }

  async clearMap() {
    this.mapView.graphics.removeAll();
  }

  async ngOnInit() {
    try {
      await this.init();
      await this.setGraphicToConectionPointsLayer();
      await this.setGraphicToCBuildingsLayer();
      // Make Map, basemap openstreetmap
      this.map = new EsriMap({
        basemap: 'osm',
        // layers:[ this.conectionPointsLayer ],
      });

      this.map.add( this.conectionPointsLayer );
      // this.map.add( this.buildingsLayer );

      // Set MapView coordonates. zoom and attach to map
      this.mapView = new EsriMapView({
        container: this.mapViewEl.nativeElement,
        center: [28.83605312111365, 47.01804284542325],
        zoom: 13,
        map: this.map,
      });

      // Create BasemamGallery widget
      const basemapGallery = new BasemapGallery({
        view: this.mapView,
      });

      // Create Expand for BasemapGallary
      const bgExpand = new Expand({
        view: this.mapView,
        content: basemapGallery,
      });

      // Create search widget
      const search = new Search({ 
        view: this.mapView,
        // sources: [ this.conectionPointsLayer ]  // Add Geocoder or layer: any
      });
      
      // Availability widget
      const availabilityWidget: Widget = new  Widget({
        text: 'Widget test container',
        height: '500px',
        width: '500px',
        padding: '10px',
        margin: '0px',
      });

      // Availability expanded widget 
      const availabilityExpandWidget = new Expand({
        content: availabilityWidget.getContainer(),
        view: this.mapView,
      });

      // Add widgets to MapView Interface
      this.mapView.ui.add([{
          component: bgExpand,
          position: "top-right",
          index: 0,           
        },{
          component: search,
          position: "top-left",
          index: 0,           
        },{
          component: availabilityExpandWidget,
          position: "top-right",
          index: 1,  
        },
      ]);


      this.mapView.on( 'click', async ( event ) => {
        try {

          let query = this.buildingsLayer.createQuery();
          query.geometry = event.mapPoint;
    
          let selectedBuilding = await this.buildingsLayer.queryFeatures( query );
    
          if( !selectedBuilding.features )
            return;
    
          this.clearMap();
          
          let selectedPoint = await this.selectBuilding( selectedBuilding.features[0] );
    
          let closestPoint = await this.getClosestConnectionPoint( selectedPoint );

          await this.selectPoint( closestPoint );

          console.log( selectedPoint, closestPoint.geometry );
          await this.drowLine( selectedPoint, closestPoint.geometry );

        } catch (error) {
          console.log(`Map::mapView.on( 'click' ) error from esri-map.component.ts: ${error}`);
        }
      });

    } catch (error) {
      console.log(`Map::ngOnInit error from esri-map.component.ts: ${error}`);
    }
  }

}
