import { IWidget, IWidgetConstructorParameters, IWidgetElement } from './esri-map.interfaces';

export class Widget implements IWidget {
    protected height: string = '100px';
    protected width: string = '100px';
    protected text: string = '';
    protected container: HTMLElement = document.createElement( 'div' );
    protected padding: string = '10px';
    protected margin: string = '0px';
    protected classList: string[] = Array( 'esri-widget', 'esri-component' );

    constructor ( widgetParameters: IWidgetConstructorParameters ) {
        try {
            if( widgetParameters.height )
                this.height = widgetParameters.height;

            if( widgetParameters.width )
                this.width = widgetParameters.width;
        
            if( widgetParameters.text )
                this.text = widgetParameters.text;

            if( widgetParameters.padding )
                this.padding = widgetParameters.padding;

            if( widgetParameters.margin )
                this.margin = widgetParameters.margin;

            this.setContainerParameters();
        } catch (error) {
            console.log(`Widget::constructor error from esri-widget.class.ts: ${error}`);
        }

    }

    protected setContainerParameters() {
        try {
            if( this.height )
                this.container.style.height = this.height;

            if( this.width )
                this.container.style.width = this.width;

            if( this.text )
                this.container.innerHTML = this.text;

            if( this.padding )
                this.container.style.padding = this.padding;

            if( this.margin )
                this.container.style.margin = this.margin;

            if( this.classList[0] && this.classList[1] )
                this.container.classList.add( this.classList[0], this.classList[1] );
            else if( this.classList[0] && !this.classList[1] )
                this.container.classList.add( this.classList[0] );

            return true;        
        } catch (error) {
            console.log(`Widget::setContainerParameters error from esri-widget.class.ts: ${error}`);                
        }
    }

    public getContainer() {
        try {
            return this.container;                
        } catch (error) {
            console.log(`Widget::getContainer error from esri-widget.class.ts: ${error}`);                
        }
    }

    public getParrams() {
        try {
            return {
                height: this.height,
                widget: this.width,
                text: this.text,
                padding: this.padding,
                margin: this.margin,
            }   
        } catch (error) {
            console.log(`Widget::getParrams error from esri-widget.class.ts: ${error}`);                                
        }
    }
    public addElement( element: IWidgetElement ) {
        try {
            return true;
        } catch (error) {
            console.log(`Widget::addElement error from esri-widget.class.ts: ${error}`);                                
        }
    }
}

