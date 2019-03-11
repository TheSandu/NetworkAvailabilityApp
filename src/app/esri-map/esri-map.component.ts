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
      
      // @ts-ignore
      let featureSet = Buildings.features.map(( feature )=>{
        feature.geometry.type = 'polygon';          
        return feature;
      });

      this.buildingsLayer = new FeatureLayer({
        // @ts-ignore
        source: Buildings.features,
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

      var diamondSymbol = {
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
      [GraphicsLayer] = await loadModules(['esri/layers/GraphicsLayer']);
      [Graphic] = await loadModules(['esri/Graphic']);
      [PopupTemplate] = await loadModules(['esri/PopupTemplate']);
      [Point] = await loadModules(['esri/geometry/Point']);
      [webMercatorUtils] = await loadModules(['esri/geometry/support/webMercatorUtils']);
      [FeatureLayer] = await loadModules(['esri/layers/FeatureLayer']);

    } catch (error) {
      console.log(`Map::init error from esri-map.component.ts: ${error}`);
    }
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

      // this.mapView.on('click', (event)=>{
      //   console.log(event);
      // });
      
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


      this.mapView.on( 'click', async( event )=>{
        try {
    
          let query = this.buildingsLayer.createQuery();
          query.geometry = event.mapPoint;
    
          let selectedBuilding = await this.buildingsLayer.queryFeatures( query );

          if( !selectedBuilding.features )
            return;

          let selectedGraphic = new Graphic({
            geometry: selectedBuilding.features[0].geometry,
            attributes: selectedBuilding.features[0].attributes,
            symbol: {
              type: "simple-fill",  // autocasts as new SimpleFillSymbol()
              color: [ 255, 128, 0, 0.5 ],
              outline: {  // autocasts as new SimpleLineSymbol()
                width: 1,
                color: "black"
              }
            }
          });

          let selectedGraphicLayer = new GraphicsLayer({
            graphics: [selectedGraphic],
          });

          this.map.layers.remove( selectedGraphicLayer );
          this.map.layers.add( selectedGraphicLayer );
        } catch (error) {
          console.log(`Map::mapView.on( 'click' ) error from esri-map.component.ts: ${error}`);
        }
      });

    } catch (error) {
      console.log(`Map::ngOnInit error from esri-map.component.ts: ${error}`);
    }
  }

}
