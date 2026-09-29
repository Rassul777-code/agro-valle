import {
createContext,
useEffect,
useState
} from "react"

import {supabase} from "../supabase/client"


export const GanadoContext=createContext()


export function GanadoProvider({children}){

const [ganado,setGanado]=useState([])

const [cargandoGanado,setCargandoGanado]=useState(true)

const [errorGanado,setErrorGanado]=useState("")



/*
========================================
ADAPTAR PUBLICACIÓN PARA LA INTERFAZ
========================================
*/

function adaptarPublicacion(animal){

return{

...animal,

edad:
animal.edad!==null &&
animal.edad!==undefined
? `${animal.edad} años`
: "",

peso:
animal.peso!==null &&
animal.peso!==undefined
? `${animal.peso} kg`
: "",

precio:
animal.precio!==null &&
animal.precio!==undefined
? `${animal.precio} Bs`
: "",

tipoPrecio:
animal.tipo_precio || ""

}

}



/*
========================================
CARGAR PUBLICACIONES
========================================
*/

async function cargarGanado(){

setCargandoGanado(true)

setErrorGanado("")


const {data,error}=
await supabase
.from("publicaciones")
.select("*")
.order("creado_en",{
ascending:false
})


if(error){

console.error(
"Error cargando publicaciones:",
error
)

setErrorGanado(
"No se pudieron cargar las publicaciones."
)

setCargandoGanado(false)

return

}


const publicaciones=
(data || []).map(
adaptarPublicacion
)


setGanado(publicaciones)

setCargandoGanado(false)

}



/*
========================================
CARGAR AL INICIAR
========================================
*/

useEffect(()=>{

cargarGanado()

},[])



/*
========================================
AGREGAR GANADO
========================================
*/

async function agregarGanado(animal){

setErrorGanado("")


/*
----------------------------------------
OBTENER USUARIO LOCAL
----------------------------------------
*/

const usuarioGuardado=
localStorage.getItem(
"usuarioAgroValle"
)


if(!usuarioGuardado){

return{

success:false,

error:
"Debes iniciar sesión para publicar."

}

}


const usuario=
JSON.parse(usuarioGuardado)


if(!usuario.id){

return{

success:false,

error:
"No se encontró tu perfil de Agro Valle."

}

}



/*
----------------------------------------
COMPROBAR SESIÓN REAL
----------------------------------------
*/

const {
data:{
session
},
error:sessionError
}=
await supabase.auth.getSession()


if(sessionError || !session){

return{

success:false,

error:
"Tu sesión ha expirado. Inicia sesión nuevamente."

}

}



/*
----------------------------------------
CONVERTIR EDAD
----------------------------------------
*/

const edadNumero=
parseFloat(

String(
animal.edad || ""
)

.replace(
" años",
""
)

)



/*
----------------------------------------
CONVERTIR PESO
----------------------------------------
*/

const pesoNumero=
parseFloat(

String(
animal.peso || ""
)

.replace(
" kg",
""
)

)



/*
----------------------------------------
CONVERTIR PRECIO
----------------------------------------
*/

const precioNumero=
parseFloat(

String(
animal.precio || ""
)

.replace(
" Bs",
""
)

)



/*
----------------------------------------
DATOS PARA SUPABASE
----------------------------------------
*/

const nuevaPublicacion={

usuario_id:
usuario.id,

nombre:
animal.nombre,

tipo:
animal.tipo || null,

raza:
animal.raza,

sexo:
animal.sexo || null,

edad:
Number.isNaN(edadNumero)
? null
: edadNumero,

peso:
Number.isNaN(pesoNumero)
? null
: pesoNumero,

precio:
Number.isNaN(precioNumero)
? 0
: precioNumero,

tipo_precio:
animal.tipoPrecio || null,

salud:
animal.salud || null,

descripcion:
animal.descripcion || null,

estado:
animal.estado || "Disponible",

departamento:
usuario.departamento || null,

provincia:
usuario.provincia || null,

municipio:
usuario.municipio || null,

ubicacion:
animal.ubicacion ||
[
usuario.municipio,
usuario.provincia,
usuario.departamento
]
.filter(Boolean)
.join(" - "),

telefono:
usuario.telefono || null,

vendedor:
usuario.nombre || null,

imagen:
animal.imagen || null

}



/*
----------------------------------------
INSERTAR PUBLICACIÓN
----------------------------------------
*/

const {
data,
error
}=
await supabase
.from("publicaciones")
.insert(
nuevaPublicacion
)
.select()
.single()


if(error){

console.error(
"Error publicando ganado:",
error
)

return{

success:false,

error:error.message

}

}



/*
----------------------------------------
ACTUALIZAR CATÁLOGO
----------------------------------------
*/

await cargarGanado()



/*
----------------------------------------
DEVOLVER PUBLICACIÓN E ID
----------------------------------------
*/

return{

success:true,

data:data,

id:data.id

}

}



/*
========================================
EDITAR GANADO
========================================
*/

async function editarGanado(
id,
datosActualizados
){

const actualizacion={}



/*
----------------------------------------
TÍTULO
----------------------------------------
*/

if(
datosActualizados.nombre!==undefined
){

actualizacion.nombre=
datosActualizados.nombre

}



/*
----------------------------------------
TIPO
----------------------------------------
*/

if(
datosActualizados.tipo!==undefined
){

actualizacion.tipo=
datosActualizados.tipo

}



/*
----------------------------------------
RAZA
----------------------------------------
*/

if(
datosActualizados.raza!==undefined
){

actualizacion.raza=
datosActualizados.raza

}



/*
----------------------------------------
SEXO
----------------------------------------
*/

if(
datosActualizados.sexo!==undefined
){

actualizacion.sexo=
datosActualizados.sexo

}



/*
----------------------------------------
SALUD
----------------------------------------
*/

if(
datosActualizados.salud!==undefined
){

actualizacion.salud=
datosActualizados.salud

}



/*
----------------------------------------
DESCRIPCIÓN
----------------------------------------
*/

if(
datosActualizados.descripcion!==undefined
){

actualizacion.descripcion=
datosActualizados.descripcion

}



/*
----------------------------------------
IMAGEN PRINCIPAL
----------------------------------------
*/

if(
datosActualizados.imagen!==undefined
){

actualizacion.imagen=
datosActualizados.imagen || null

}



/*
----------------------------------------
TIPO DE PRECIO
----------------------------------------
*/

if(
datosActualizados.tipoPrecio!==undefined
){

actualizacion.tipo_precio=
datosActualizados.tipoPrecio

}



/*
----------------------------------------
ESTADO
----------------------------------------
*/

if(
datosActualizados.estado!==undefined
){

actualizacion.estado=
datosActualizados.estado

}



/*
----------------------------------------
EDAD
----------------------------------------
*/

if(
datosActualizados.edad!==undefined
){

const edadNumero=
parseFloat(

String(
datosActualizados.edad
)

.replace(
" años",
""
)

)


actualizacion.edad=
Number.isNaN(edadNumero)
? null
: edadNumero

}



/*
----------------------------------------
PESO
----------------------------------------
*/

if(
datosActualizados.peso!==undefined
){

const pesoNumero=
parseFloat(

String(
datosActualizados.peso
)

.replace(
" kg",
""
)

)


actualizacion.peso=
Number.isNaN(pesoNumero)
? null
: pesoNumero

}



/*
----------------------------------------
PRECIO
----------------------------------------
*/

if(
datosActualizados.precio!==undefined
){

const precioNumero=
parseFloat(

String(
datosActualizados.precio
)

.replace(
" Bs",
""
)

)


actualizacion.precio=
Number.isNaN(precioNumero)
? 0
: precioNumero

}



/*
----------------------------------------
ACTUALIZAR EN SUPABASE
----------------------------------------
*/

const {error}=
await supabase
.from("publicaciones")
.update(
actualizacion
)
.eq(
"id",
id
)


if(error){

console.error(
"Error editando publicación:",
error
)

return{

success:false,

error:error.message

}

}


await cargarGanado()


return{

success:true

}

}



/*
========================================
CAMBIAR ESTADO
========================================
*/

async function cambiarEstadoGanado(
id,
nuevoEstado
){

const {error}=
await supabase
.from("publicaciones")
.update({

estado:nuevoEstado

})
.eq(
"id",
id
)


if(error){

console.error(
"Error cambiando estado:",
error
)

return{

success:false,

error:error.message

}

}


await cargarGanado()


return{

success:true

}

}



/*
========================================
ELIMINAR GANADO
========================================
*/

async function eliminarGanado(id){

const {error}=
await supabase
.from("publicaciones")
.delete()
.eq(
"id",
id
)


if(error){

console.error(
"Error eliminando publicación:",
error
)

return{

success:false,

error:error.message

}

}


await cargarGanado()


return{

success:true

}

}



/*
========================================
PROVIDER
========================================
*/

return(

<GanadoContext.Provider

value={{

ganado,

cargandoGanado,

errorGanado,

cargarGanado,

agregarGanado,

editarGanado,

eliminarGanado,

cambiarEstadoGanado

}}

>

{children}

</GanadoContext.Provider>

)

}


export default GanadoContext