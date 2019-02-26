import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { loadModules } from 'esri-loader';
import { Widget } from './esri-widget.class';
import ConnectionPoints from './layers/conection-points.data.json';

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

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {

  @ViewChild('mapViewNode')
  private mapViewEl: ElementRef;
  private conectionPointsLayer: any;
  private connectionLayerPopup: any;
  private map: any;
  private mapView: any;

  constructor() { }

  async setGraphicToConectionPointsLayer( graphics: any,  geometry?: any, symbology?: any, attributes?: any ) {
    try {

      for ( let graphic of graphics ) {

        // console.log(  webMercatorUtils.toLatitudeLongitude( new Point({x:graphic.x,y:graphic.y}) ) );

        var point = {
          type: "point",  // autocasts as new Point()
          longitude: webMercatorUtils.xyToLngLat(graphic.x,graphic.y)[0],
          latitude: webMercatorUtils.xyToLngLat(graphic.x,graphic.y)[1],
        };
  
        let markerSymbol = {
          type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
          color: [226, 119, 40]
        };
  
        let pointAtt = attributes || {
          Type: "SanduPoint",
          Owner: "TheSandu",
        };
  
        let popUp = {
          title:'Test',
          content:'{Owner}'
        }

        let pointGraphic = new Graphic({
          geometry: point,
          symbol: markerSymbol,
          attributes: pointAtt,
          popupTemplate: popUp
        }); 
        
        this.conectionPointsLayer.add( pointGraphic );
      }
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

      this.conectionPointsLayer = new GraphicsLayer();

    } catch (error) {
      console.log(`Map::init error from esri-map.component.ts: ${error}`);
    }
  }

  async ngOnInit() {
    try {

      await this.init();
      await this.setGraphicToConectionPointsLayer( ConnectionPoints );
      // Make Map, basemap openstreetmap
      this.map = new EsriMap({
        basemap: 'osm',
        // layers:[ this.conectionPointsLayer ],
      });

      this.map.add( this.conectionPointsLayer );


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
        sources: [ this.conectionPointsLayer ]  // Add Geocoder or layer: any
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

    } catch (error) {
      console.log(`Map::ngOnInit error from esri-map.component.ts: ${error}`);
    }
  }

}
