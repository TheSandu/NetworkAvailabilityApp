import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { loadModules } from 'esri-loader';
import { Widget } from './esri-widget.class';
// import ConnectionPoints from './layers/conection-points.data.json';
// import Buildings from './layers/Chisinau_buildings.json';

import { NetworkAvailabilityService } from './services/NetworkAvailabilityService';

var test = new NetworkAvailabilityService();

import { ActivatedRouteSnapshot } from '@angular/router';

let ConnectionPoints: any;
let Buildings: any;

let EsriMap: any;
let EsriMapView: any;
let Expand: any;
let BasemapGallery: any;
let Search: any;
let Graphic: any;
let LayerList: any;
let FeatureLayer: any;
let Polygon: any;
let Polyline: any;
let Draw: any;
let webMercatorUtils: any;
let geometryEngine: any;
let watchUtils: any;
let GraphicsLayer: any;

let opticalFiberPrice = 12; // MDL
let opticalFiberServiceOffset = 3000; // meters
let opticalAmplifierPrice = 348; // MDL

let utpPrice = 8; // MDL
let utpServiceOffset = 100; // meters

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
  private selectedBuilding: any;
  private closestPointFromSelectedBuilding: any;
  private availabilityExpandWidget: any;

  constructor() { }







  // ***************************************** SET LAYERS ***********************

  // ********* SET BUILDING LAYER 
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

  // ************ CONNECTION POINTS LAYER
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
        title: 'Connection Points Layer',
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

  // ***************************************** SET LAYERS ***********************






  // ***************************************** GET ******************************

  // ******** GET CONNECTION POINT IN RADIUS
  async getConnectionPointInRadius( centroid, diamentru ) {
    try {

      if ( !centroid )
        return;

      let closestConnectionPoint: any;
    
      let query = this.conectionPointsLayer.createQuery();
      query.geometry = centroid;
      query.distance = diamentru;
      
      closestConnectionPoint = await this.conectionPointsLayer.queryFeatures( query );

      return closestConnectionPoint.features.lenght !== 0 && closestConnectionPoint.features[0];

    } catch (error) {
      console.log(`Map::getConnectionPointInRadius error from esri-map.component.ts: ${error}`);
    }
  }

  // ************* GET CLOSEST CONNECTION POINT
  async getClosestConnectionPoint( centroid ) {
    try {

      if ( !centroid )
        return;

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

  // *************** GET GEODESIC DISTANCE METERS
  async getDistance( vertices ) {

    const graphic = new Graphic({
      geometry: {
        type: "polyline",
        paths: vertices,
        spatialReference: this.mapView.spatialReference
      }
    });

    let lenght = await geometryEngine.geodesicLength( graphic.geometry, 9001);
    return lenght;
  }

  // ********** GET SELECTED POINT
  async selectPoint( point ) {

    try {
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
    } catch (error) {
      console.log(`Map::selectPoint error from esri-map.component.ts: ${error}`);
    }
  }

  // ******** MESAGE
  async messages( lenght ) {
    let message;
    if( lenght < utpServiceOffset ) {
        message = `
        <div style='display: inline'><div style='font-weight: bold;'> Accessibility: </div> Este posibila trasarea cablu UTP </div>
        <hr><div style='display: inline'><div style='font-weight: bold;'> Distanta: </div>${ lenght.toFixed(3) } m </div>
        <hr><div style='display: inline'><div style='font-weight: bold;'>Pret UTP: </div>${ lenght.toFixed(3) * utpPrice } lei </div>
        <hr><div style='display: inline'><div style='font-weight: bold;'>Pret FO: </div>${ lenght.toFixed(3) * opticalFiberPrice } lei </div>
      `;
    } else if( lenght > utpServiceOffset && lenght < opticalFiberServiceOffset ){
      message = `
        <div style='display: inline'><div style='font-weight: bold;'> Accessibility: </div> Nu este posibila trasarea cablului UTP direct la client, se recomanda trasarea cablului optic </div></div>
        <hr><div style='display: inline'><div style='font-weight: bold;'>Distanta: </div> ${ lenght.toFixed(3) } m</div>
        <hr><div style='display: inline'><div style='font-weight: bold;'> Pret: </div> ${ lenght.toFixed(3) * opticalFiberPrice } lei</div>
      `;
    } else if( lenght > opticalFiberServiceOffset ) {
      let amplifierCout = lenght.toFixed(3) / opticalFiberServiceOffset;
      message = `
        <div style='display: inline'><div style='font-weight: bold;'> Accessibility: </div>Pentru trasare este nevoie de amplificator</div>
        <hr><div style='display: inline'><div style='font-weight: bold;'> Distanta: </div> ${ lenght.toFixed(3) } m</div>
        <hr><div style='display: inline'><div style='font-weight: bold;'> Pret: </div> ${ lenght.toFixed(3)  * opticalFiberPrice } + ${ parseInt(amplifierCout.toFixed()) * opticalAmplifierPrice } lei <br>( Cablul + Amplificato )</div>
      `;
    }
    return message;
  }
  // ***************************************** GET ******************************
  
  


  
  


  
  // *************** LOAD MODULES
  // ******** INITIAL LOAD
  async init() {
    try {
      ConnectionPoints = await test.getConnectioins();
      Buildings = await test.getBuildings();

      
      // Load modules from loadModules Promise
      [EsriMap] = await loadModules(['esri/Map']);
      [Graphic] = await loadModules(['esri/Graphic']);
    
      [watchUtils] = await loadModules(['esri/core/watchUtils']);
    
      [EsriMapView] = await loadModules(['esri/views/MapView']);
      [Draw] = await loadModules(['esri/views/2d/draw/Draw']);
    
      [FeatureLayer] = await loadModules(['esri/layers/FeatureLayer']);
      [GraphicsLayer] = await loadModules(['esri/layers/GraphicsLayer']);
    
      [Polygon] = await loadModules(['esri/geometry/Polygon']);
      [Polyline] = await loadModules(['esri/geometry/Polyline']);
      [geometryEngine] = await loadModules(['esri/geometry/geometryEngine']);
      [webMercatorUtils] = await loadModules(['esri/geometry/support/webMercatorUtils']);
      [BasemapGallery] = await loadModules(['esri/widgets/BasemapGallery']);
    
      [Search] = await loadModules(['esri/widgets/Search']);
      [Expand] = await loadModules(['esri/widgets/Expand']);
      [LayerList] = await loadModules(["esri/widgets/LayerList"]);

    } catch (error) {
      console.log(`Map::init error from esri-map.component.ts: ${error}`);
    }
  }


  // *************** LOAD MODULES








  // ******************************** DRAW *********************************

  // ***** Draw polygon
  async selectBuilding( feature ) {
    try {
      if( !feature.hasOwnProperty( 'geometry' ) ) 
      return;

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

      let center = new Graphic({
        geometry: selectedAsPoligon.extent.center,
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
      this.mapView.graphics.add( center );

      return selectedAsPoligon.extent.center;
    } catch (error) {
      console.log(`Map::selectBuilding error from esri-map.component.ts: ${error}`);
    }
  }

  // ***** Draw polyline
  async drawPolyline( vertices: Array<any> ) {
    try {

      if( !Array.isArray( vertices ) ) 
      return;

      let line = new Polyline({
        paths: vertices,
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
    } catch (error) {
      console.log(`Map::drawPolyline error from esri-map.component.ts: ${error}`);
    }
  }
  
  // ***** Draw line
  async drawLine( firstPoint: any, secondPoint: any ) {
    try {
      if( !firstPoint.x || !firstPoint.y || !secondPoint.x || !secondPoint.y ) {
        console.log( 'No found' );
        return;
      }
      console.log( 'Found' );

      let paths = [
          [ webMercatorUtils.xyToLngLat( firstPoint.x, firstPoint.y )[0], webMercatorUtils.xyToLngLat( firstPoint.x, firstPoint.y )[1] ],
          [ webMercatorUtils.xyToLngLat( secondPoint.x, secondPoint.y )[0], webMercatorUtils.xyToLngLat( secondPoint.x, secondPoint.y )[1] ],
        ];
        
      let line = new Polyline({
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
    } catch (error) {
      console.log(`Map::drawLine error from esri-map.component.ts: ${error}`);
    }
  }

  // ******************************** DRAW *********************************













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

      // Create LayerList widget
      var layerList = new LayerList({
        view: this.mapView
      });

      // Create Expand for LayerList
      const layerListExpand = new Expand({
        view: this.mapView,
        content: layerList,
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
        text: '<div><div id=\'availabilityWidget\'></div><input id=\'drawLine\' type=\'button\' value=\'FreeHand Button\'></div>',
        height: '300px',
        width: '500px',
        padding: '10px',
        margin: '0px',
      });

      // Availability expanded widget 
      this.availabilityExpandWidget = new Expand({
        content: availabilityWidget.getContainer(),
        view: this.mapView,
      });

      
      // Add widgets to MapView Interface
      await this.mapView.ui.add([{
        component: bgExpand,
          position: "top-right",
          index: 0,           
        },{
          component: search,
          position: "top-left",
          index: 0,           
        },{
          component: this.availabilityExpandWidget,
          position: "top-right",
          index: 1,  
        },{
          component: layerListExpand,
          position: "bottom-left",
          index: 0,
        }
      ]);
      
      let draw = new Draw({
        view: this.mapView,
      });

      let self = this;
      
      watchUtils.whenFalse( this.availabilityExpandWidget, 'expanded', () => {
        try {
          draw.complete();
          self.mapView.graphics.removeAll();
        } catch (error) {
          console.log( 'On expand error:', error );
        }
      });

      // draw polyline button
      document.getElementById("drawLine").onclick = async function() {
        self.mapView.graphics.removeAll();
          
        await self.selectBuilding( self.selectedBuilding );
        await self.selectPoint( self.closestPointFromSelectedBuilding );

        document.getElementById( 'availabilityWidget' ).innerHTML = '';

        // Get the last segment of the polyline that is being drawn
        function getLastSegment(polyline) {
          const line = polyline.clone();
          const lastXYPoint = line.removePoint(0, line.paths[0].length - 1);
          const existingLineFinalPoint = line.getPoint(
            0,
            line.paths[0].length - 1
          );

          return {
            type: "polyline",
            spatialReference: self.mapView.spatialReference,
            hasZ: false,
            paths: [
              [
                [existingLineFinalPoint.x, existingLineFinalPoint.y],
                [lastXYPoint.x, lastXYPoint.y]
              ]
            ]
          };
        }

        // function that checks if the line intersects itself
        function isSelfIntersecting(polyline) {
          if (polyline.paths[0].length < 3) {
            return false;
          }
          const line = polyline.clone();

          //get the last segment from the polyline that is being drawn
          const lastSegment = getLastSegment(polyline);
          line.removePoint(0, line.paths[0].length - 1);

          // returns true if the line intersects itself, false otherwise
          return geometryEngine.crosses(lastSegment, line);
        }

        // Checks if the line intersects itself. If yes, change the last
        // segment's symbol giving a visual feedback to the user.
        function getIntersectingSegment(polyline) {
          if (isSelfIntersecting(polyline)) {
            return new Graphic({
              geometry: getLastSegment(polyline),
              symbol: {
                type: "simple-line", // autocasts as new SimpleLineSymbol
                style: "short-dot",
                width: 3.5,
                color: "yellow"
              }
            });
          }
          return null;
        }


        // create a new graphic presenting the polyline that is being drawn on the view
        async function createGraphic(event) {
          try {
            const vertices = event.vertices;
            self.mapView.graphics.removeAll();
  
            let pointFirst = {
              geometry: {
                type: "point", // autocasts as new Point()
                longitude: webMercatorUtils.xyToLngLat( event.vertices[ 0 ][0], event.vertices[ 0 ][1] )[0],
                latitude: webMercatorUtils.xyToLngLat( event.vertices[ 0 ][0], event.vertices[ 0 ][1] )[1]
              }
            };
  
            let pointLast = {
              geometry: {
                type: "point", // autocasts as new Point()
                longitude: webMercatorUtils.xyToLngLat( event.vertices[ event.vertices.length - 1 ][0], event.vertices[ event.vertices.length - 1 ][1] )[0],
                latitude: webMercatorUtils.xyToLngLat( event.vertices[ event.vertices.length - 1 ][0], event.vertices[ event.vertices.length - 1 ][1] )[1]
              }
            };
  
            let graphicStart = self.selectPoint( pointFirst );
  
            let graphicFinish = self.selectPoint( pointLast );
  
            // a graphic representing the polyline that is being drawn
            const graphic = new Graphic({
              geometry: {
                type: "polyline",
                paths: vertices,
                spatialReference: self.mapView.spatialReference
              }, symbol: {
                type: "simple-line",
                style: "short-dash",
                width: 1.75,
                color: [255, 0, 0, 1]
              }
            });
  
            // check if the polyline intersects itself.
            const intersectingSegment = getIntersectingSegment(graphic.geometry);
            // Add a new graphic for the intersecting segment.
            if (intersectingSegment) {
              self.mapView.graphics.addMany([graphic, intersectingSegment, graphicStart, graphicFinish]);
              await self.selectBuilding( self.selectedBuilding );
              await self.selectPoint( self.closestPointFromSelectedBuilding );
            }
            // Just add the graphic representing the polyline if no intersection
            else {
              await self.selectBuilding( self.selectedBuilding );
              await self.selectPoint( self.closestPointFromSelectedBuilding );
              self.mapView.graphics.addMany([graphic, graphicStart, graphicFinish]);
            }
  
            // return intersectingSegment
            return {
              selfIntersects: intersectingSegment
            };
  
          } catch (error) {
            console.log( 'Error on createGraphic: ', error );
          }
        }

        // Checks if the last vertex is making the line intersect itself.
        async function updateVertices(event) {
          // create a polyline from returned vertices
          // if (event.vertices.length - 1 > 1) {
            const result = await createGraphic(event);

            // if the last vertex is making the line intersects itself,
            // prevent the events from firing
            if (result.selfIntersects) {
              event.preventDefault();
            }
          // }

        }

        async function addVordex( event ) {
          let pointFirst = {
            geometry: {
              type: "point", // autocasts as new Point()
              longitude: webMercatorUtils.xyToLngLat( event.vertices[ 0 ][0], event.vertices[ 0 ][1] )[0],
              latitude: webMercatorUtils.xyToLngLat( event.vertices[ 0 ][0], event.vertices[ 0 ][1] )[1]
            }
          };

          let pointLast = {
            geometry: {
              type: "point", // autocasts as new Point()
              longitude: webMercatorUtils.xyToLngLat( event.vertices[ event.vertices.length - 1 ][0], event.vertices[ event.vertices.length - 1 ][1] )[0],
              latitude: webMercatorUtils.xyToLngLat( event.vertices[ event.vertices.length - 1 ][0], event.vertices[ event.vertices.length - 1 ][1] )[1]
            }
          };

          let closestPoint = await self.getConnectionPointInRadius( pointLast.geometry , 10);
          
          
          if( closestPoint ){
            event.vertices.pop();
            
            let positionXY = webMercatorUtils.lngLatToXY( closestPoint.geometry.x, closestPoint.geometry.y );

            event.vertices.push( [ positionXY[0], positionXY[1] ] );
            updateVertices( event );
            draw.complete();
            return;
          }

          updateVertices( event );

        }

        async function stopDrawing( event ) {
          try {
            const graphic = new Graphic({
              geometry: {
                type: "polyline",
                paths: event.vertices,
                spatialReference: self.mapView.spatialReference
              }
            });

            let lenght =  await self.getDistance( event.vertices ); /* await geometryEngine.geodesicLength( graphic.geometry, 9001); */

            document.getElementById( 'availabilityWidget' ).innerHTML = await self.messages( lenght );
         
          } catch (error) {
            console.log( 'On complite event error: ', error );
          }


        }

        const action = draw.create("polyline");

        action.on( "draw-complete", stopDrawing );

        action.on( "vertex-add", addVordex);

        action.on(
          [
            "vertex-remove",
            "cursor-update",
            "redo",
            "undo"
          ],
          updateVertices
        );

      }

      this.mapView.on( 'click', async ( event ) => {
        try {

          let query = this.buildingsLayer.createQuery();
          query.geometry = event.mapPoint;
    
          let selectedBuilding = await this.buildingsLayer.queryFeatures( query );
    
          if( !selectedBuilding.features.length )
            return;
    
          this.clearMap();
          
          let selectedPoint = await this.selectBuilding( selectedBuilding.features[0] );
          
          this.selectedBuilding = selectedBuilding.features[0];
          
          let closestPoint = await this.getClosestConnectionPoint( selectedPoint );

          this.closestPointFromSelectedBuilding = closestPoint;

          if( !closestPoint.hasOwnProperty( 'geometry' ) ) {
            console.log('si cu geometria', closestPoint.geometry);
            return;
          }

          await this.selectPoint( closestPoint );


          await this.drawLine( selectedPoint, closestPoint.geometry );

          // let distance = geometryEngine.distance(selectedPoint, closestPoint.geometry , 9001);

          let lenght = await this.getDistance([[selectedPoint.x, selectedPoint.y], [closestPoint.geometry.x, closestPoint.geometry.y]]);

          document.getElementById( 'availabilityWidget' ).innerHTML = await this.messages( lenght );

          if ( !this.availabilityExpandWidget.expanded )
            this.availabilityExpandWidget.expand();

        } catch (error) {
          console.log(`Map::mapView.on( 'click' ) error from esri-map.component.ts: ${error}`);
        }
      });

    } catch (error) {
      console.log(`Map::ngOnInit error from esri-map.component.ts: ${error}`);
    }
  }

}