import fetch from 'node-fetch';

export class NetworkAvailabilityService {

    public collection: any;

    constructor( ) {  }

    public async getConnectioins(){
        let res = await fetch('http://localhost:8080/api/connections');
        let json = await res.json();
        return json;
    }

    public async getBuildings(){
        let res = await fetch('http://localhost:8080/api/buildings');
        let json = await res.json();
        return json;
    }

    public async sendReport( name, phone , lenght, text, price ) {

        let params = { name: name, phone: phone, lenght: lenght, text: text, price: price};

        let res = await fetch(`http://localhost:8080/api/report/insert`, { 
            method: 'POST', 
            mode: "cors", 
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify( params ),
        });
        
        let resText = await res.text();
        return resText;
    }

    public async sendLog( vertices, date ) {
        let res = await fetch(`http://localhost:8080/api/log/insert`, {
            method: 'POST', 
            mode: "cors", 
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify( { vertices: vertices, data: date } ),
        });
        
        let resText = await res.text();
        return resText;
    }

}