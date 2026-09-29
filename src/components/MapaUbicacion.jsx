import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";


function MapaUbicacion(){

const posicion = [
-17.9167,
-64.5167
];


return(

<div className="mt-5">


<h2 className="font-bold text-lg mb-3">
Ubicación del ganado
</h2>


<MapContainer

center={posicion}

zoom={13}

style={{
height:"300px",
width:"100%",
borderRadius:"20px"
}}

>


<TileLayer

url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"

/>


<Marker position={posicion}/>


</MapContainer>


</div>

)

}


export default MapaUbicacion;