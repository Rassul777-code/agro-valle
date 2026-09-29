import {
BrowserRouter,
Routes,
Route
} from "react-router-dom"


import {
GanadoProvider
} from "./context/GanadoContext"


import RutaProtegida from "./components/RutaProtegida"


import Inicio from "./pages/Inicio"
import Registro from "./pages/Registro"
import RegistroGanaderia from "./pages/RegistroGanaderia"
import PublicarGanado from "./pages/PublicarGanado"
import DetalleGanado from "./pages/DetalleGanado"
import MiCuenta from "./pages/MiCuenta"
import EditarGanado from "./pages/EditarGanado"
import Login from "./pages/Login"
import PerfilVendedor from "./pages/PerfilVendedor"
import PublicarSolicitud from "./pages/PublicarSolicitud"
import DetalleSolicitud from "./pages/DetalleSolicitud"
import EditarSolicitud from "./pages/EditarSolicitud"




function App(){


return(


<GanadoProvider>


<BrowserRouter basename="/agro-valle">


<Routes>


{/* PÚBLICAS */}

<Route
path="/"
element={<Inicio/>}
/>



<Route
path="/registro"
element={<Registro/>}
/>



<Route
path="/login"
element={<Login/>}
/>



<Route
path="/registro-ganaderia"
element={<RegistroGanaderia/>}
/>



<Route
path="/ganado/:id"
element={<DetalleGanado/>}
/>



<Route
path="/perfil-vendedor/:id"
element={<PerfilVendedor/>}
/>



<Route
path="/solicitud/:id"
element={<DetalleSolicitud/>}
/>





{/* PROTEGIDAS */}



<Route

path="/publicar-ganado"

element={

<RutaProtegida>

<PublicarGanado/>

</RutaProtegida>

}

/>





<Route

path="/mi-cuenta"

element={

<RutaProtegida>

<MiCuenta/>

</RutaProtegida>

}

/>





<Route

path="/editar-ganado/:id"

element={

<RutaProtegida>

<EditarGanado/>

</RutaProtegida>

}

/>





<Route

path="/publicar-solicitud"

element={

<RutaProtegida>

<PublicarSolicitud/>

</RutaProtegida>

}

/>





<Route

path="/editar-solicitud/:id"

element={

<RutaProtegida>

<EditarSolicitud/>

</RutaProtegida>

}

/>



</Routes>


</BrowserRouter>


</GanadoProvider>


)

}


export default App