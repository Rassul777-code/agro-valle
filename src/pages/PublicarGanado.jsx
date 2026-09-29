import {useContext,useState} from "react"
import {useNavigate} from "react-router-dom"

import {GanadoContext} from "../context/GanadoContext"
import {supabase} from "../supabase/client"


function PublicarGanado(){

const navigate=useNavigate()

const {agregarGanado}=useContext(GanadoContext)


const usuarioGuardado=
localStorage.getItem("usuarioAgroValle")

const usuario=
usuarioGuardado
? JSON.parse(usuarioGuardado)
: null



/*
========================================
RAZAS SEGÚN TIPO DE ANIMAL
========================================
*/

const razasPorTipo={

Toro:[
"Nelore",
"Brahman",
"Gyr",
"Angus",
"Brangus",
"Senepol",
"Simmental",
"Charolais",
"Limousin",
"Criollo",
"Mestizo",
"Otra"
],

Vaca:[
"Nelore",
"Brahman",
"Gyr",
"Girolando",
"Holstein",
"Pardo Suizo",
"Jersey",
"Angus",
"Brangus",
"Simmental",
"Criolla",
"Mestiza",
"Otra"
],

Caballo:[
"Criollo",
"Cuarto de Milla",
"Árabe",
"Appaloosa",
"Percherón",
"Pura Sangre",
"Paint Horse",
"Paso Peruano",
"Mestizo",
"Otra"
],

Cerdo:[
"Duroc",
"Landrace",
"Yorkshire",
"Pietrain",
"Hampshire",
"Criollo",
"Mestizo",
"Otra"
],

Caprino:[
"Boer",
"Saanen",
"Alpina",
"Anglo-Nubian",
"Toggenburg",
"Criolla",
"Mestiza",
"Otra"
]

}



const tiposEquipo=[

"Tractor",
"Remolque",
"Ordeñadora",
"Balanza ganadera",
"Picadora",
"Molino",
"Mezcladora",
"Corral",
"Bebedero",
"Comedero",
"Equipo veterinario",
"Implemento agrícola",
"Otro"

]



const condicionesEquipo=[

"Nuevo",
"Usado - Excelente estado",
"Usado - Buen estado",
"Usado - Estado regular",
"Para reparar"

]



const [datos,setDatos]=useState({

nombre:"",
tipo:"Toro",

raza:"",
sexo:"Macho",
edad:"",
peso:"",

precio:"",
tipoPrecio:"Por animal",

salud:"",
descripcion:"",

tipoEquipo:"",
marca:"",
modelo:"",
anio:"",
condicion:""

})


const [fotos,setFotos]=useState([])

const [cargando,setCargando]=useState(false)

const [error,setError]=useState("")



/*
========================================
CAMBIAR DATOS
========================================
*/

function cambiarDato(e){

const {name,value}=e.target


/*
----------------------------------------
CAMBIO DE TIPO
----------------------------------------
*/

if(name==="tipo"){

let sexo=""

if(value==="Toro"){
sexo="Macho"
}

if(value==="Vaca"){
sexo="Hembra"
}


setDatos((anteriores)=>({

...anteriores,

tipo:value,

raza:"",
sexo:sexo,
edad:"",
peso:"",
salud:"",

tipoEquipo:"",
marca:"",
modelo:"",
anio:"",
condicion:"",

tipoPrecio:
value==="Equipo"
? "Por unidad"
: "Por animal"

}))


return

}


setDatos((anteriores)=>({

...anteriores,

[name]:value

}))

}



/*
========================================
SELECCIONAR FOTOS
========================================
*/

function seleccionarFotos(e){

const archivos=
Array.from(e.target.files)

setError("")


if(archivos.length===0){
return
}


if(
fotos.length + archivos.length > 4
){

setError(
"Puedes seleccionar un máximo de 4 fotografías."
)

e.target.value=""

return

}


const tamañoMaximo=
5 * 1024 * 1024


for(const archivo of archivos){

if(!archivo.type.startsWith("image/")){

setError(
"Solo puedes seleccionar archivos de imagen."
)

e.target.value=""

return

}


if(archivo.size>tamañoMaximo){

setError(
"Cada fotografía debe pesar como máximo 5 MB."
)

e.target.value=""

return

}

}


setFotos((anteriores)=>[

...anteriores,
...archivos

])


e.target.value=""

}



/*
========================================
ELIMINAR FOTO SELECCIONADA
========================================
*/

function eliminarFoto(indice){

setFotos((anteriores)=>
anteriores.filter(
(_,i)=>i!==indice
)
)

}



/*
========================================
SUBIR UNA FOTO A STORAGE
========================================
*/

async function subirFoto(
archivo,
authId,
indice
){

const partes=
archivo.name.split(".")


const extension=
partes.length>1
? partes.pop().toLowerCase()
: "jpg"


const identificador=
`${Date.now()}-${crypto.randomUUID()}`


const nombreArchivo=
`${identificador}-${indice}.${extension}`


const ruta=
`${authId}/${nombreArchivo}`


const {error:uploadError}=
await supabase
.storage
.from("ganado")
.upload(
ruta,
archivo,
{
cacheControl:"3600",
upsert:false,
contentType:archivo.type
}
)


if(uploadError){

console.error(
"Error subiendo fotografía:",
uploadError
)

throw new Error(
"No se pudo subir una de las fotografías."
)

}


const {data:urlData}=
supabase
.storage
.from("ganado")
.getPublicUrl(ruta)


return{

url:urlData.publicUrl,

ruta:ruta

}

}



/*
========================================
BORRAR FOTOS SUBIDAS SI ALGO FALLA
========================================
*/

async function limpiarFotosSubidas(
fotosSubidas
){

if(fotosSubidas.length===0){
return
}


const rutas=
fotosSubidas.map(
(foto)=>foto.ruta
)


const {error}=
await supabase
.storage
.from("ganado")
.remove(rutas)


if(error){

console.error(
"No se pudieron limpiar algunas fotos:",
error
)

}

}



/*
========================================
PUBLICAR
========================================
*/

async function publicar(){

setError("")


if(!usuario){

navigate("/login")

return

}


if(!usuario.id){

setError(
"No se encontró tu perfil de Agro Valle. Cierra sesión e inicia sesión nuevamente."
)

return

}



/*
========================================
VALIDACIÓN PARA EQUIPO
========================================
*/

if(datos.tipo==="Equipo"){

if(
!datos.nombre ||
!datos.tipoEquipo ||
!datos.precio ||
!datos.condicion
){

setError(
"Completa el título, tipo de equipo, condición y precio."
)

return

}


if(Number(datos.precio)<=0){

setError(
"El precio debe ser mayor a 0."
)

return

}


if(
datos.anio &&
(
Number(datos.anio)<1900 ||
Number(datos.anio)>new Date().getFullYear()+1
)
){

setError(
"Ingresa un año válido para el equipo."
)

return

}

}



/*
========================================
VALIDACIÓN PARA ANIMALES
========================================
*/

else{

if(
!datos.nombre ||
!datos.tipo ||
!datos.raza ||
!datos.sexo ||
!datos.edad ||
!datos.peso ||
!datos.precio
){

setError(
"Completa los datos principales del animal."
)

return

}


if(Number(datos.edad)<=0){

setError(
"La edad debe ser mayor a 0."
)

return

}


if(Number(datos.peso)<=0){

setError(
"El peso debe ser mayor a 0."
)

return

}


if(Number(datos.precio)<=0){

setError(
"El precio debe ser mayor a 0."
)

return

}

}


setCargando(true)


let fotosSubidas=[]

let publicacionCreada=null


try{


/*
========================================
OBTENER SESIÓN REAL
========================================
*/

const {
data:{
session
},
error:sessionError
}=
await supabase.auth.getSession()


if(sessionError || !session){

throw new Error(
"Tu sesión ha expirado. Inicia sesión nuevamente."
)

}



/*
========================================
SUBIR FOTOS
========================================
*/

for(
let i=0;
i<fotos.length;
i++
){

const fotoSubida=
await subirFoto(
fotos[i],
session.user.id,
i
)


fotosSubidas.push(
fotoSubida
)

}



/*
========================================
CREAR UBICACIÓN
========================================
*/

const ubicacion=[
usuario.municipio,
usuario.provincia,
usuario.departamento
]
.filter(Boolean)
.join(" - ")
/*
========================================
CREAR PUBLICACIÓN
========================================
*/

const nuevoAnimal={

usuario_id:usuario.id,

vendedor:usuario.nombre,

nombre:datos.nombre,

tipo:datos.tipo,

raza:
datos.tipo==="Equipo"
? null
: datos.raza,

sexo:
datos.tipo==="Equipo"
? null
: datos.sexo,

edad:
datos.tipo==="Equipo"
? null
: datos.edad,

peso:
datos.tipo==="Equipo"
? null
: datos.peso,

precio:datos.precio,

telefono:usuario.telefono,

tipoPrecio:datos.tipoPrecio,

salud:
datos.tipo==="Equipo"
? null
: datos.salud,

descripcion:datos.descripcion,

estado:"Disponible",

ubicacion:ubicacion,

imagen:
fotosSubidas.length>0
? fotosSubidas[0].url
: "",

tipo_equipo:
datos.tipo==="Equipo"
? datos.tipoEquipo
: null,

marca:
datos.tipo==="Equipo"
? datos.marca
: null,

modelo:
datos.tipo==="Equipo"
? datos.modelo
: null,

anio:
datos.tipo==="Equipo" && datos.anio
? Number(datos.anio)
: null,

condicion:
datos.tipo==="Equipo"
? datos.condicion
: null

}



/*
========================================
GUARDAR PUBLICACIÓN
========================================
*/

const resultado=
await agregarGanado(
nuevoAnimal
)


if(!resultado?.success){

throw new Error(
resultado?.error ||
"No se pudo guardar la publicación."
)

}


publicacionCreada=
resultado.id


if(!publicacionCreada){

throw new Error(
"No se pudo obtener el ID de la publicación."
)

}



/*
========================================
GUARDAR FOTOS EN publicacion_fotos
========================================
*/

if(fotosSubidas.length>0){

const registrosFotos=
fotosSubidas.map(
(foto,index)=>({

publicacion_id:
publicacionCreada,

url:
foto.url,

ruta_storage:
foto.ruta,

orden:
index

})
)


const {error:fotosError}=
await supabase
.from("publicacion_fotos")
.insert(
registrosFotos
)


if(fotosError){

console.error(
"Error guardando fotografías:",
fotosError
)

throw new Error(
"No se pudieron asociar las fotografías con la publicación."
)

}

}



/*
========================================
TODO CORRECTO
========================================
*/

setCargando(false)


alert(
datos.tipo==="Equipo"
?
"¡Equipo publicado correctamente!"
:
"¡Ganado publicado correctamente!"
)


navigate("/")


}catch(errorGeneral){

console.error(
"Error al publicar:",
errorGeneral
)


if(!publicacionCreada){

await limpiarFotosSubidas(
fotosSubidas
)

}


setError(
errorGeneral.message ||
"No se pudo crear la publicación."
)


setCargando(false)

}

}



/*
========================================
USUARIO NO AUTENTICADO
========================================
*/

if(!usuario){

return(

<div className="min-h-screen bg-green-50 flex items-center justify-center p-6">


<div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 text-center">


<h1 className="text-2xl font-bold text-green-700">

Inicia sesión para publicar

</h1>


<p className="text-gray-600 mt-3">

Necesitas una cuenta de Agro Valle para publicar.

</p>


<button
type="button"
onClick={()=>navigate("/login")}
className="w-full bg-green-700 text-white p-4 rounded-xl mt-6 font-bold"
>

Iniciar sesión

</button>


<button
type="button"
onClick={()=>navigate("/registro")}
className="w-full border-2 border-green-700 text-green-700 p-4 rounded-xl mt-3 font-bold"
>

Crear cuenta

</button>


<button
type="button"
onClick={()=>navigate("/")}
className="w-full text-gray-600 p-3 mt-2 font-bold"
>

Volver

</button>


</div>


</div>

)

}



return(

<div className="min-h-screen bg-green-50 p-6">


<div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8">


<h1 className="text-3xl font-bold text-green-700">

Publicar en Agro Valle

</h1>


<p className="text-gray-600 mt-2">

Completa la información de lo que deseas vender.

</p>



{/* =====================================
VENDEDOR
===================================== */}

<div className="bg-green-50 rounded-2xl p-4 mt-6">


<p className="text-sm text-gray-500">

Publicando como

</p>


<p className="font-bold text-green-700">

{usuario.nombre}

</p>


<p className="text-sm text-gray-600 mt-1">

📍 {

[
usuario.municipio,
usuario.provincia,
usuario.departamento
]
.filter(Boolean)
.join(" - ")

}

</p>


</div>



{/* =====================================
TÍTULO
===================================== */}

<label className="block font-bold mt-6">

Título de la publicación

</label>


<input
name="nombre"
value={datos.nombre}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
placeholder={
datos.tipo==="Equipo"
?
"Ej: Tractor agrícola John Deere"
:
datos.tipo==="Caballo"
?
"Ej: Caballo Criollo de 4 años"
:
datos.tipo==="Cerdo"
?
"Ej: Cerdo Duroc de 8 meses"
:
datos.tipo==="Caprino"
?
"Ej: Cabra Boer reproductora"
:
datos.tipo==="Vaca"
?
"Ej: Vaca Brahman"
:
"Ej: Toro Nelore de 3 años"
}
/>



{/* =====================================
TIPO
===================================== */}

<label className="block font-bold mt-5">

Tipo de publicación

</label>


<select
name="tipo"
value={datos.tipo}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="Toro">
Toro
</option>

<option value="Vaca">
Vaca
</option>

<option value="Caballo">
Caballo
</option>

<option value="Cerdo">
Cerdo
</option>

<option value="Caprino">
Caprino
</option>

<option value="Equipo">
Equipo
</option>

</select>



{/* =====================================
FORMULARIO PARA ANIMALES
===================================== */}

{datos.tipo!=="Equipo" && (

<>


{/* RAZA */}

<label className="block font-bold mt-5">

Raza

</label>


<select
name="raza"
value={datos.raza}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="">

Seleccionar raza

</option>


{
(razasPorTipo[datos.tipo] || [])
.map((raza)=>(

<option
key={raza}
value={raza}
>

{raza}

</option>

))
}


</select>



{/* SEXO SOLO PARA CABALLO, CERDO Y CAPRINO */}

{
datos.tipo!=="Toro" &&
datos.tipo!=="Vaca" && (

<>

<label className="block font-bold mt-5">

Sexo

</label>


<select
name="sexo"
value={datos.sexo}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="">

Seleccionar

</option>

<option value="Macho">

Macho

</option>

<option value="Hembra">

Hembra

</option>

</select>

</>

)}




<div className="grid md:grid-cols-2 gap-4 mt-5">


<div>

<label className="block font-bold">

Edad en años

</label>


<input
name="edad"
value={datos.edad}
onChange={cambiarDato}
type="number"
min="0"
step="0.1"
className="w-full border rounded-xl p-3 mt-2"
placeholder="Ej: 3"
/>

</div>



<div>

<label className="block font-bold">

Peso aproximado (kg)

</label>


<input
name="peso"
value={datos.peso}
onChange={cambiarDato}
type="number"
min="0"
step="0.1"
className="w-full border rounded-xl p-3 mt-2"
placeholder="Ej: 450"
/>

</div>


</div>



{/* SALUD */}

<label className="block font-bold mt-5">

Estado de salud

</label>


<input
name="salud"
value={datos.salud}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
placeholder="Ej: Vacunado y desparasitado"
/>


</>

)}



{/* =====================================
FORMULARIO PARA EQUIPO
===================================== */}

{datos.tipo==="Equipo" && (

<>


<label className="block font-bold mt-5">

Tipo de equipo

</label>


<select
name="tipoEquipo"
value={datos.tipoEquipo}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="">

Seleccionar tipo de equipo

</option>


{
tiposEquipo.map((tipo)=>(

<option
key={tipo}
value={tipo}
>

{tipo}

</option>

))
}


</select>



<div className="grid md:grid-cols-2 gap-4 mt-5">


<div>

<label className="block font-bold">

Marca

</label>


<input
name="marca"
value={datos.marca}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
placeholder="Ej: John Deere"
/>

</div>



<div>

<label className="block font-bold">

Modelo

</label>


<input
name="modelo"
value={datos.modelo}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
placeholder="Ej: 6110J"
/>

</div>


</div>



<div className="grid md:grid-cols-2 gap-4 mt-5">


<div>

<label className="block font-bold">

Año

</label>


<input
name="anio"
value={datos.anio}
onChange={cambiarDato}
type="number"
min="1900"
max={new Date().getFullYear()+1}
className="w-full border rounded-xl p-3 mt-2"
placeholder="Ej: 2020"
/>

</div>



<div>

<label className="block font-bold">

Condición

</label>


<select
name="condicion"
value={datos.condicion}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="">

Seleccionar condición

</option>


{
condicionesEquipo.map((condicion)=>(

<option
key={condicion}
value={condicion}
>

{condicion}

</option>

))
}


</select>

</div>


</div>


</>

)}
{/* =====================================
PRECIO
===================================== */}

<label className="block font-bold mt-5">

Precio (Bs)

</label>


<input
name="precio"
value={datos.precio}
onChange={cambiarDato}
type="number"
min="0"
step="0.01"
className="w-full border rounded-xl p-3 mt-2"
placeholder={
datos.tipo==="Equipo"
?
"Ej: 95000"
:
"Ej: 8500"
}
/>



<label className="block font-bold mt-5">

Tipo de precio

</label>


<select
name="tipoPrecio"
value={datos.tipoPrecio}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
>


{
datos.tipo==="Equipo"
?

<>

<option value="Por unidad">

Por unidad

</option>

<option value="Negociable">

Negociable

</option>

</>

:

<>

<option value="Por animal">

Por animal

</option>

<option value="Por kilo">

Por kilo

</option>

<option value="Negociable">

Negociable

</option>

</>

}


</select>



{/* =====================================
DESCRIPCIÓN
===================================== */}

<label className="block font-bold mt-5">

Descripción

</label>


<textarea
name="descripcion"
value={datos.descripcion}
onChange={cambiarDato}
rows="4"
className="w-full border rounded-xl p-3 mt-2"
placeholder={
datos.tipo==="Equipo"
?
"Describe el equipo, funcionamiento, mantenimiento, accesorios incluidos, detalles de uso, etc."
:
"Describe el animal, genética, alimentación, características, vacunas, producción, etc."
}
/>



{/* =====================================
FOTOGRAFÍAS
===================================== */}

<label className="block font-bold mt-5">

Fotografías

</label>


<p className="text-sm text-gray-500 mt-1">

Selecciona hasta 4 fotografías. La primera será la portada.

</p>


<input
type="file"
accept="image/*"
multiple
onChange={seleccionarFotos}
className="w-full border rounded-xl p-3 mt-2"
/>



{/* =====================================
VISTA PREVIA
===================================== */}

{fotos.length>0 && (

<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">


{fotos.map((foto,index)=>(

<div
key={`${foto.name}-${foto.lastModified}-${index}`}
className="relative"
>


<img
src={URL.createObjectURL(foto)}
alt={`Foto ${index+1}`}
className="w-full h-28 object-cover rounded-xl"
/>


<button
type="button"
onClick={()=>eliminarFoto(index)}
className="absolute top-1 right-1 bg-white text-red-600 rounded-full w-8 h-8 font-bold shadow"
>

×

</button>


{index===0 && (

<div className="absolute bottom-1 left-1 bg-green-700 text-white text-xs px-2 py-1 rounded">

Portada

</div>

)}


<div className="absolute bottom-1 right-1 bg-white text-gray-700 text-xs px-2 py-1 rounded">

{index+1}/4

</div>


</div>

))}


</div>

)}



{/* =====================================
RESUMEN SEGÚN TIPO
===================================== */}

<div className="bg-green-50 rounded-2xl p-5 mt-6">


<p className="font-bold text-green-700">

Resumen de la publicación

</p>


<p className="text-sm text-gray-600 mt-2">

Tipo:{" "}

<span className="font-bold">

{datos.tipo}

</span>

</p>


{
datos.tipo==="Equipo"

?

<>

<p className="text-sm text-gray-600 mt-1">

Equipo:{" "}

<span className="font-bold">

{datos.tipoEquipo || "Sin seleccionar"}

</span>

</p>


{datos.marca && (

<p className="text-sm text-gray-600 mt-1">

Marca:{" "}

<span className="font-bold">

{datos.marca}

</span>

</p>

)}


{datos.modelo && (

<p className="text-sm text-gray-600 mt-1">

Modelo:{" "}

<span className="font-bold">

{datos.modelo}

</span>

</p>

)}


{datos.anio && (

<p className="text-sm text-gray-600 mt-1">

Año:{" "}

<span className="font-bold">

{datos.anio}

</span>

</p>

)}


{datos.condicion && (

<p className="text-sm text-gray-600 mt-1">

Condición:{" "}

<span className="font-bold">

{datos.condicion}

</span>

</p>

)}

</>

:

<>

<p className="text-sm text-gray-600 mt-1">

Raza:{" "}

<span className="font-bold">

{datos.raza || "Sin seleccionar"}

</span>

</p>


<p className="text-sm text-gray-600 mt-1">

Sexo:{" "}

<span className="font-bold">

{datos.sexo || "Sin seleccionar"}

</span>

</p>


{datos.edad && (

<p className="text-sm text-gray-600 mt-1">

Edad:{" "}

<span className="font-bold">

{datos.edad} años

</span>

</p>

)}


{datos.peso && (

<p className="text-sm text-gray-600 mt-1">

Peso aproximado:{" "}

<span className="font-bold">

{datos.peso} kg

</span>

</p>

)}

</>

}


{datos.precio && (

<p className="text-sm text-gray-600 mt-1">

Precio:{" "}

<span className="font-bold text-green-700">

{datos.precio} Bs

</span>

</p>

)}


</div>



{/* =====================================
ERROR
===================================== */}

{error && (

<div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mt-6">

{error}

</div>

)}



{/* =====================================
BOTONES
===================================== */}

<button
type="button"
onClick={publicar}
disabled={cargando}
className="w-full bg-green-700 text-white p-4 rounded-xl mt-7 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
>

{
cargando
?
"Subiendo fotos y publicando..."
:
datos.tipo==="Equipo"
?
"Publicar equipo"
:
"Publicar ganado"
}

</button>


<button
type="button"
onClick={()=>navigate("/")}
disabled={cargando}
className="w-full border-2 border-green-700 text-green-700 p-4 rounded-xl mt-3 font-bold disabled:opacity-50"
>

Cancelar

</button>


</div>


</div>

)

}


export default PublicarGanado