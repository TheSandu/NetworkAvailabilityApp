import fetch from 'node-fetch';

export class NetworkAvailabilityService {

    public collection: any;

    constructor( ) {

        console.log('LOL');

    }

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

}