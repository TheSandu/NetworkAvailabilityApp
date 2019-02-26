export interface IWidget {
    getParrams(): IConstructorParameters;
    getContainer(): HTMLElement;
    addElement( element: IWidgetElement ): boolean;
}

export interface IWidgetConstructorParameters {
    height?: string;
    text?: string;
    width?: string;
    padding?: string;
    margin?: string;
}

export interface IConstructorParameters {
    height?: string;
    text?: string;
    width?: string;
    padding?: string;
    margin?: string;
}

export interface IWidgetButton extends IWidgetElement {
    onClick( action: EventListenerOrEventListenerObject ): IWidgetElement;
}

export interface IWidgetElement {
    container: HTMLElement;
}