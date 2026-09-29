import {
useEffect,
useState
} from "react"

import {
useNavigate,
useParams
} from "react-router-dom"

import {
supabase
} from "../supabase/client"



function EditarGanado(){


const {id}=useParams()

const navigate=useNavigate()



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



const [animal,setAnimal]=useState(null)

const [usuario,setUsuario]=useState(null)

const [perfilId,setPerfilId]=useState(null)



const [formulario,setFormulario]=useState({

nombre:"",

tipo:"",

raza:"",

sexo:"",

edad:"",

peso:"",

precio:"",

tipoPrecio:"",

descripcion:"",

salud:"",

estado:"Disponible",

tipoEquipo:"",

marca:"",

modelo:"",

anio:"",

condicion:""

})



const [imagen,setImagen]=useState("")

const [archivoImagen,setArchivoImagen]=useState(null)

const [error,setError]=useState("")

const [guardando,setGuardando]=useState(false)





useEffect(()=>{


cargarUsuario()


},[])





/*
========================================
VERIFICAR USUARIO AUTENTICADO
========================================
*/

async function cargarUsuario(){


const {
data,
error:usuarioError
}=await supabase.auth.getUser()



if(
usuarioError ||
!data.user
){


navigate("/login")

return

}



setUsuario(
data.user
)



/*
========================================
OBTENER ID REAL DEL PERFIL
========================================
*/

const {
data:perfil,
error:perfilError
}=await supabase
.from("perfiles")
.select("id")
.eq(
"auth_id",
data.user.id
)
.single()



if(
perfilError ||
!perfil
){


console.log(
perfilError
)


setError(
"No se encontró tu perfil de Agro Valle."
)


return

}



setPerfilId(
perfil.id
)



cargarAnimal(
perfil.id
)


}





/*
========================================
CARGAR PUBLICACIÓN DEL USUARIO
========================================
*/

async function cargarAnimal(
idPerfil
){


const {
data,
error
}=await supabase
.from("publicaciones")
.select("*")
.eq(
"id",
id
)
.eq(
"usuario_id",
idPerfil
)
.single()



if(
error ||
!data
){


console.log(error)


setError(
"No tienes permiso para editar esta publicación."
)


return

}



setAnimal(data)



setFormulario({

nombre:
data.nombre || "",

tipo:
data.tipo || "",

raza:
data.raza || "",

sexo:
data.sexo || "",

edad:
data.edad ?? "",

peso:
data.peso ?? "",

precio:
data.precio ?? "",

tipoPrecio:
data.tipo_precio ||
(
data.tipo==="Equipo"
?
"Por unidad"
:
"Por animal"
),

descripcion:
data.descripcion || "",

salud:
data.salud || "",

estado:
data.estado || "Disponible",

tipoEquipo:
data.tipo_equipo || "",

marca:
data.marca || "",

modelo:
data.modelo || "",

anio:
data.anio ?? "",

condicion:
data.condicion || ""

})



setImagen(
data.imagen || ""
)


}





/*
========================================
CAMBIAR DATOS
========================================
*/

function cambiarDato(e){


const {
name,
value
}=e.target



/*
----------------------------------------
SI CAMBIA EL TIPO
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



setFormulario(
(anteriores)=>({

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
?
"Por unidad"
:
"Por animal"

})
)


return

}



setFormulario(
(anteriores)=>({

...anteriores,

[name]:value

})
)


}





/*
========================================
SELECCIONAR IMAGEN
========================================
*/

function seleccionarImagen(e){


const archivo=
e.target.files[0]



if(!archivo){

return

}



if(
!archivo.type.startsWith("image/")
){


setError(
"Selecciona una imagen válida."
)


return

}



const tamañoMaximo=
5 * 1024 * 1024



if(
archivo.size>tamañoMaximo
){


setError(
"La fotografía debe pesar como máximo 5 MB."
)


e.target.value=""

return

}



setArchivoImagen(
archivo
)



setImagen(
URL.createObjectURL(
archivo
)
)



setError("")


}





function eliminarImagen(){


setImagen("")

setArchivoImagen(null)


}



/*
========================================
SUBIR NUEVA IMAGEN
========================================
*/

async function subirNuevaImagen(){


if(!archivoImagen){

return imagen

}



const partes=
archivoImagen.name.split(".")



const extension=
partes.length>1
?
partes.pop().toLowerCase()
:
"jpg"



const nombre=
`${Date.now()}-${crypto.randomUUID()}.${extension}`



const ruta=
`${usuario.id}/${nombre}`



const {
error
}=await supabase
.storage
.from("ganado")
.upload(
ruta,
archivoImagen,
{
cacheControl:"3600",
upsert:false,
contentType:archivoImagen.type
}
)



if(error){

throw error

}



const {
data
}=supabase
.storage
.from("ganado")
.getPublicUrl(
ruta
)



return data.publicUrl


}
/*
========================================
GUARDAR CAMBIOS
========================================
*/

async function guardarCambios(){


setError("")



if(
!usuario ||
!perfilId
){

navigate("/login")

return

}



/*
========================================
VALIDAR EQUIPO
========================================
*/

if(formulario.tipo==="Equipo"){


if(
!formulario.nombre ||
!formulario.tipoEquipo ||
!formulario.precio ||
!formulario.condicion
){

setError(
"Completa el título, tipo de equipo, condición y precio."
)

return

}



if(
Number(formulario.precio)<=0
){

setError(
"El precio debe ser mayor a 0."
)

return

}



if(
formulario.anio &&
(
Number(formulario.anio)<1900 ||
Number(formulario.anio)>
new Date().getFullYear()+1
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
VALIDAR ANIMAL
========================================
*/

else{


if(
!formulario.nombre ||
!formulario.tipo ||
!formulario.raza ||
!formulario.sexo ||
!formulario.edad ||
!formulario.peso ||
!formulario.precio
){

setError(
"Completa los datos principales del animal."
)

return

}



if(
Number(formulario.edad)<=0
){

setError(
"La edad debe ser mayor a 0."
)

return

}



if(
Number(formulario.peso)<=0
){

setError(
"El peso debe ser mayor a 0."
)

return

}



if(
Number(formulario.precio)<=0
){

setError(
"El precio debe ser mayor a 0."
)

return

}


}



setGuardando(true)



try{


const nuevaImagen=
await subirNuevaImagen()



/*
========================================
DATOS ACTUALIZADOS
========================================
*/

const datosActualizados={


nombre:
formulario.nombre.trim(),


tipo:
formulario.tipo,


raza:
formulario.tipo==="Equipo"
?
null
:
formulario.raza,


sexo:
formulario.tipo==="Equipo"
?
null
:
formulario.sexo,


edad:
formulario.tipo==="Equipo"
?
null
:
Number(formulario.edad),


peso:
formulario.tipo==="Equipo"
?
null
:
Number(formulario.peso),


precio:
Number(formulario.precio),


tipo_precio:
formulario.tipoPrecio,


descripcion:
formulario.descripcion || null,


salud:
formulario.tipo==="Equipo"
?
null
:
formulario.salud || null,


estado:
formulario.estado,


imagen:
nuevaImagen || null,


tipo_equipo:
formulario.tipo==="Equipo"
?
formulario.tipoEquipo
:
null,


marca:
formulario.tipo==="Equipo"
?
formulario.marca || null
:
null,


modelo:
formulario.tipo==="Equipo"
?
formulario.modelo || null
:
null,


anio:
formulario.tipo==="Equipo" &&
formulario.anio
?
Number(formulario.anio)
:
null,


condicion:
formulario.tipo==="Equipo"
?
formulario.condicion
:
null


}



/*
========================================
ACTUALIZAR EN SUPABASE
========================================
*/

const {
error
}=await supabase
.from("publicaciones")
.update(
datosActualizados
)
.eq(
"id",
animal.id
)
.eq(
"usuario_id",
perfilId
)



if(error){

throw error

}



alert(
formulario.tipo==="Equipo"
?
"Equipo actualizado correctamente."
:
"Publicación actualizada correctamente."
)



navigate(
"/mi-cuenta"
)



}catch(error){


console.log(
"Error actualizando publicación:",
error
)


setError(
"No se pudieron guardar los cambios."
)


}



setGuardando(false)


}





/*
========================================
CARGANDO PUBLICACIÓN
========================================
*/

if(!animal){


return(

<div className="min-h-screen bg-green-50 flex items-center justify-center p-6">


<div className="bg-white p-8 rounded-3xl shadow text-center max-w-md w-full">


{

error

?

<p className="text-red-600 font-bold">

{error}

</p>

:

<p className="text-green-700 font-bold">

Cargando publicación...

</p>

}


{

error && (

<button
type="button"
onClick={()=>navigate("/mi-cuenta")}
className="w-full border-2 border-green-700 text-green-700 p-3 rounded-xl mt-5 font-bold"
>

Volver a mi cuenta

</button>

)

}


</div>


</div>

)

}





return(

<div className="min-h-screen bg-green-50 p-6">


<div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8">


<h1 className="text-3xl font-bold text-green-700">

Editar publicación

</h1>


<p className="text-gray-600 mt-2">

{
formulario.tipo==="Equipo"
?
"Modifica los datos de tu equipo."
:
"Modifica los datos de tu ganado."
}

</p>



{/* =====================================
TÍTULO
===================================== */}

<label className="block font-bold mt-6">

Título de la publicación

</label>


<input
name="nombre"
value={formulario.nombre}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
placeholder={
formulario.tipo==="Equipo"
?
"Ej: Tractor agrícola John Deere"
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
value={formulario.tipo}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="">

Seleccionar

</option>

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
FORMULARIO DE ANIMAL
===================================== */}

{formulario.tipo!=="Equipo" && (

<>


<label className="block font-bold mt-5">

Raza

</label>


<select
name="raza"
value={formulario.raza}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="">

Seleccionar raza

</option>


{
(formulario.raza &&
!(razasPorTipo[formulario.tipo] || [])
.includes(formulario.raza)
) && (

<option value={formulario.raza}>

{formulario.raza}

</option>

)
}


{
(razasPorTipo[formulario.tipo] || [])
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



{/* SEXO */}

{
formulario.tipo!=="Toro" &&
formulario.tipo!=="Vaca" && (

<>

<label className="block font-bold mt-5">

Sexo

</label>


<select
name="sexo"
value={formulario.sexo}
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



{/* EDAD Y PESO */}

<div className="grid md:grid-cols-2 gap-4 mt-5">


<div>


<label className="block font-bold">

Edad en años

</label>


<input
name="edad"
type="number"
min="0"
step="0.1"
value={formulario.edad}
onChange={cambiarDato}
placeholder="Ej: 3"
className="w-full border rounded-xl p-3 mt-2"
/>


</div>



<div>


<label className="block font-bold">

Peso aproximado (kg)

</label>


<input
name="peso"
type="number"
min="0"
step="0.1"
value={formulario.peso}
onChange={cambiarDato}
placeholder="Ej: 450"
className="w-full border rounded-xl p-3 mt-2"
/>


</div>


</div>



{/* SALUD */}

<label className="block font-bold mt-5">

Estado de salud

</label>


<input
name="salud"
value={formulario.salud}
onChange={cambiarDato}
placeholder="Ej: Vacunado y desparasitado"
className="w-full border rounded-xl p-3 mt-2"
/>


</>

)}
{/* =====================================
FORMULARIO DE EQUIPO
===================================== */}

{formulario.tipo==="Equipo" && (

<>


<label className="block font-bold mt-5">

Tipo de equipo

</label>


<select
name="tipoEquipo"
value={formulario.tipoEquipo}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="">

Seleccionar tipo de equipo

</option>


{
(formulario.tipoEquipo &&
!tiposEquipo.includes(formulario.tipoEquipo)
) && (

<option value={formulario.tipoEquipo}>

{formulario.tipoEquipo}

</option>

)
}


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
value={formulario.marca}
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
value={formulario.modelo}
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
type="number"
min="1900"
max={new Date().getFullYear()+1}
value={formulario.anio}
onChange={cambiarDato}
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
value={formulario.condicion}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="">

Seleccionar condición

</option>


{
(formulario.condicion &&
!condicionesEquipo.includes(formulario.condicion)
) && (

<option value={formulario.condicion}>

{formulario.condicion}

</option>

)
}


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
type="number"
min="0"
step="0.01"
value={formulario.precio}
onChange={cambiarDato}
placeholder={
formulario.tipo==="Equipo"
?
"Ej: 95000"
:
"Ej: 8500"
}
className="w-full border rounded-xl p-3 mt-2"
/>



<label className="block font-bold mt-5">

Tipo de precio

</label>


<select
name="tipoPrecio"
value={formulario.tipoPrecio}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
>


{
formulario.tipo==="Equipo"

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
ESTADO DE LA PUBLICACIÓN
===================================== */}

<label className="block font-bold mt-5">

Estado de la publicación

</label>


<select
name="estado"
value={formulario.estado}
onChange={cambiarDato}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="Disponible">

Disponible

</option>

<option value="Reservado">

Reservado

</option>

<option value="Vendido">

Vendido

</option>

</select>



{/* =====================================
DESCRIPCIÓN
===================================== */}

<label className="block font-bold mt-5">

Descripción

</label>


<textarea
name="descripcion"
value={formulario.descripcion}
onChange={cambiarDato}
rows="4"
placeholder={
formulario.tipo==="Equipo"
?
"Describe el equipo, funcionamiento, mantenimiento, accesorios incluidos, detalles de uso, etc."
:
"Describe el animal, genética, alimentación, características, vacunas, producción, etc."
}
className="w-full border rounded-xl p-3 mt-2"
/>



{/* =====================================
FOTOGRAFÍA
===================================== */}

<div className="mt-6">


<h2 className="font-bold text-green-700">

Fotografía principal

</h2>


<p className="text-sm text-gray-500 mt-1">

Puedes mantener la fotografía actual o seleccionar una nueva.

</p>



{imagen && (

<img
src={imagen}
alt={
formulario.tipo==="Equipo"
?
"Equipo"
:
"Ganado"
}
className="w-full h-64 object-cover rounded-2xl mt-3"
/>

)}



<input
type="file"
accept="image/*"
onChange={seleccionarImagen}
className="w-full border rounded-xl p-3 mt-3"
/>



{imagen && (

<button
type="button"
onClick={eliminarImagen}
className="w-full border-2 border-red-500 text-red-600 p-3 rounded-xl mt-3 font-bold"
>

Quitar fotografía

</button>

)}


</div>



{/* =====================================
RESUMEN
===================================== */}

<div className="bg-green-50 rounded-2xl p-5 mt-6">


<p className="font-bold text-green-700">

Resumen

</p>


<p className="text-sm text-gray-600 mt-2">

Tipo:{" "}

<span className="font-bold">

{formulario.tipo || "Sin seleccionar"}

</span>

</p>



{
formulario.tipo==="Equipo"

?

<>

<p className="text-sm text-gray-600 mt-1">

Equipo:{" "}

<span className="font-bold">

{formulario.tipoEquipo || "Sin seleccionar"}

</span>

</p>


{formulario.marca && (

<p className="text-sm text-gray-600 mt-1">

Marca:{" "}

<span className="font-bold">

{formulario.marca}

</span>

</p>

)}


{formulario.modelo && (

<p className="text-sm text-gray-600 mt-1">

Modelo:{" "}

<span className="font-bold">

{formulario.modelo}

</span>

</p>

)}


{formulario.anio && (

<p className="text-sm text-gray-600 mt-1">

Año:{" "}

<span className="font-bold">

{formulario.anio}

</span>

</p>

)}


{formulario.condicion && (

<p className="text-sm text-gray-600 mt-1">

Condición:{" "}

<span className="font-bold">

{formulario.condicion}

</span>

</p>

)}

</>

:

<>

<p className="text-sm text-gray-600 mt-1">

Raza:{" "}

<span className="font-bold">

{formulario.raza || "Sin seleccionar"}

</span>

</p>


<p className="text-sm text-gray-600 mt-1">

Sexo:{" "}

<span className="font-bold">

{formulario.sexo || "Sin seleccionar"}

</span>

</p>


{formulario.edad && (

<p className="text-sm text-gray-600 mt-1">

Edad:{" "}

<span className="font-bold">

{formulario.edad} años

</span>

</p>

)}


{formulario.peso && (

<p className="text-sm text-gray-600 mt-1">

Peso:{" "}

<span className="font-bold">

{formulario.peso} kg

</span>

</p>

)}

</>

}



{formulario.precio && (

<p className="text-sm text-gray-600 mt-1">

Precio:{" "}

<span className="font-bold text-green-700">

{formulario.precio} Bs

</span>

</p>

)}


</div>



{/* =====================================
ERROR
===================================== */}

{error && (

<div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mt-5">

{error}

</div>

)}



{/* =====================================
BOTONES
===================================== */}

<button
type="button"
onClick={guardarCambios}
disabled={guardando}
className="w-full bg-green-700 text-white p-4 rounded-xl mt-7 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
>

{
guardando
?
"Guardando..."
:
"Guardar cambios"
}

</button>



<button
type="button"
onClick={()=>navigate("/mi-cuenta")}
disabled={guardando}
className="w-full border-2 border-green-700 text-green-700 p-3 rounded-xl mt-3 font-bold disabled:opacity-50"
>

Cancelar

</button>


</div>


</div>

)

}


export default EditarGanado