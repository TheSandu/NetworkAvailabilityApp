import { loadModules } from 'esri-loader';

async function modules() {
    let modules = await loadModules(['esri/Map', 
                                     'esri/views/MapView', 
                                     'esri/widgets/Expand', 
                                     'esri/widgets/BasemapGallery', 
                                     'esri/widgets/Search', 
                                     'esri/Graphic', 
                                     'esri/layers/GraphicsLayer',
                                     'esri/PopupTemplate',
                                     'esri/geometry/Point',
                                     'esri/geometry/support/webMercatorUtils',
                                    ]);
    return modules;
}

const moduleExported = modules();

export { moduleExported } 