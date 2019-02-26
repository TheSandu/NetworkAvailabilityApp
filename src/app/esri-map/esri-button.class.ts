import { IWidgetButton, IWidgetConstructorParameters } from './esri-map.interfaces';

export class Button implements  IWidgetButton {

    container: HTMLElement = document.createElement('button');

    protected height: string;
    protected width: string;
    protected value: string;
    protected padding: string;
    protected margin: string;
    protected classList: string[] = Array( 'esri-widget', 'esri-component' );

    constructor( ButtonpParams: IWidgetConstructorParameters ) {
        try {
            if( ButtonpParams.height )
                this.height = ButtonpParams.height;

            if( ButtonpParams.width )
                this.width = ButtonpParams.width;
        
            if( ButtonpParams.text )
                this.value = ButtonpParams.text;

            if( ButtonpParams.padding )
                this.padding = ButtonpParams.padding;

            if( ButtonpParams.margin )
                this.margin = ButtonpParams.margin;

            this.setContainerParameters();
        } catch (error) {
            console.log(`Button::constructor error from esri-button.class.ts: ${error}`); 
        }
    }
    protected setContainerParameters() {
        try {
            if( this.height )
                this.container.style.height = this.height;

            if( this.width )
                this.container.style.width = this.width;

            if( this.value )
                this.container.innerText = this.value;

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
            console.log(`Button::setContainerParameters error from esri-button.class.ts: ${error}`);         
        }
    }

    public onClick( action: EventListenerOrEventListenerObject ) {
        try {
            this.container.addEventListener('click', action);
            return this;
        } catch (error) {
            console.log(`Button::onClick error from esri-button.class.ts: ${error}`); 
        }
    }
}