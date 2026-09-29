import {
useState
} from "react"

import {
useNavigate
} from "react-router-dom"

import {
supabase
} from "../supabase/client"



function PublicarSolicitud(){


const navigate=useNavigate()


const [formulario,setFormulario]=useState({

titulo:"",
tipoGanado:"",
raza:"",
sexo:"",
cantidad:"",
edadMin:"",
edadMax:"",
pesoMin:"",
pesoMax:"",
presupuesto:"",
tipoPresupuesto:"Por cabeza",
departamento:"",
provincia:"",
municipio:"",
urgencia:"Sin urgencia",
descripcion:""

})


const [error,setError]=useState("")

const [publicando,setPublicando]=useState(false)





function cambiarDato(e){


setFormulario({

...formulario,

[e.target.name]:e.target.value

})


}





async function publicarSolicitud(){


setError("")



if(

!formulario.titulo ||

!formulario.tipoGanado

){


setError(

"Completa el título y el tipo de ganado que estás buscando."

)


return

}



setPublicando(true)



try{


/*
========================================
VERIFICAR SESIÓN
========================================
*/

const {

data:datosSesion,

error:errorSesion

}=await supabase.auth.getSession()



if(

errorSesion ||

!datosSesion.session

){


navigate("/login")

return

}





const authId=

datosSesion.session.user.id






/*
========================================
BUSCAR PERFIL DEL USUARIO
========================================
*/

const {

data:perfil,

error:errorPerfil

}=await supabase

.from("perfiles")

.select("*")

.eq(
"auth_id",
authId
)

.single()





if(

errorPerfil ||

!perfil

){


throw new Error(

"No se encontró el perfil del usuario."

)


}






/*
========================================
CREAR SOLICITUD
========================================
*/

const nuevaSolicitud={


usuario_id:
perfil.id,


titulo:
formulario.titulo,


tipo_ganado:
formulario.tipoGanado,


raza:
formulario.raza || null,


sexo:
formulario.sexo || null,


cantidad:
formulario.cantidad
?
Number(formulario.cantidad)
:
null,


edad_min:
formulario.edadMin
?
Number(formulario.edadMin)
:
null,


edad_max:
formulario.edadMax
?
Number(formulario.edadMax)
:
null,


peso_min:
formulario.pesoMin
?
Number(formulario.pesoMin)
:
null,


peso_max:
formulario.pesoMax
?
Number(formulario.pesoMax)
:
null,


presupuesto:
formulario.presupuesto
?
Number(formulario.presupuesto)
:
null,


tipo_presupuesto:
formulario.tipoPresupuesto,


departamento:
formulario.departamento ||
perfil.departamento ||
null,


provincia:
formulario.provincia ||
perfil.provincia ||
null,


municipio:
formulario.municipio ||
perfil.municipio ||
null,


urgencia:
formulario.urgencia,


descripcion:
formulario.descripcion || null,


telefono:
perfil.telefono || null,


estado:
"Activa"


}





const {

data,

error

}=await supabase

.from("solicitudes_compra")

.insert(

nuevaSolicitud

)

.select()

.single()





if(error){

throw error

}





alert(

"Solicitud de compra publicada correctamente."

)



navigate(

`/solicitud/${data.id}`

)



}catch(error){


console.error(

"Error publicando solicitud:",

error

)


setError(

error.message ||

"No se pudo publicar la solicitud."

)


}



setPublicando(false)


}
return(

<div className="min-h-screen bg-green-50 p-6">


<div className="max-w-3xl mx-auto">


<button

type="button"

onClick={()=>navigate("/")}

className="text-green-700 font-bold mb-5"

>

← Volver al inicio

</button>




<div className="bg-white rounded-3xl shadow-xl p-7 md:p-9">


<div>


<p className="text-green-700 font-bold">

Agro Valle

</p>


<h1 className="text-3xl font-bold text-gray-800 mt-1">

Publicar solicitud de compra

</h1>


<p className="text-gray-600 mt-2">

Indica qué ganado estás buscando para que los productores puedan contactarte.

</p>


</div>





{/* TÍTULO */}

<label className="block font-bold mt-7">

¿Qué estás buscando?

</label>


<input

type="text"

name="titulo"

value={formulario.titulo}

onChange={cambiarDato}

placeholder="Ej: Busco 20 terneros Nelore"

className="w-full border rounded-xl p-3 mt-2"

/>





{/* TIPO DE GANADO */}

<label className="block font-bold mt-5">

Tipo de ganado

</label>


<select

name="tipoGanado"

value={formulario.tipoGanado}

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

<option value="Ternero">

Ternero

</option>

<option value="Ternera">

Ternera

</option>

<option value="Ovino">

Ovino

</option>

<option value="Caprino">

Caprino

</option>

<option value="Caballo">

Caballo

</option>

<option value="Cerdo">

Cerdo

</option>

</select>





{/* RAZA Y SEXO */}

<div className="grid md:grid-cols-2 gap-4 mt-5">


<div>


<label className="block font-bold">

Raza

</label>


<input

type="text"

name="raza"

value={formulario.raza}

onChange={cambiarDato}

placeholder="Ej: Nelore"

className="w-full border rounded-xl p-3 mt-2"

/>


</div>



<div>


<label className="block font-bold">

Sexo

</label>


<select

name="sexo"

value={formulario.sexo}

onChange={cambiarDato}

className="w-full border rounded-xl p-3 mt-2"

>

<option value="">

Cualquiera

</option>

<option value="Macho">

Macho

</option>

<option value="Hembra">

Hembra

</option>

</select>


</div>


</div>





{/* CANTIDAD */}

<label className="block font-bold mt-5">

Cantidad de animales

</label>


<input

type="number"

name="cantidad"

min="1"

value={formulario.cantidad}

onChange={cambiarDato}

placeholder="Ej: 20"

className="w-full border rounded-xl p-3 mt-2"

/>





{/* EDAD */}

<div className="mt-6">


<h2 className="font-bold text-green-700">

Edad buscada

</h2>


<p className="text-sm text-gray-500 mt-1">

Puedes dejar estos campos vacíos si la edad no es importante.

</p>


<div className="grid grid-cols-2 gap-4 mt-3">


<div>


<label className="block text-sm font-bold">

Edad mínima

</label>


<input

type="number"

name="edadMin"

min="0"

step="0.1"

value={formulario.edadMin}

onChange={cambiarDato}

placeholder="Ej: 8"

className="w-full border rounded-xl p-3 mt-2"

/>


</div>



<div>


<label className="block text-sm font-bold">

Edad máxima

</label>


<input

type="number"

name="edadMax"

min="0"

step="0.1"

value={formulario.edadMax}

onChange={cambiarDato}

placeholder="Ej: 12"

className="w-full border rounded-xl p-3 mt-2"

/>


</div>


</div>


<p className="text-xs text-gray-500 mt-2">

Edad expresada en meses o según lo que indiques en la descripción.

</p>


</div>





{/* PESO */}

<div className="mt-6">


<h2 className="font-bold text-green-700">

Peso buscado

</h2>


<div className="grid grid-cols-2 gap-4 mt-3">


<div>


<label className="block text-sm font-bold">

Peso mínimo (kg)

</label>


<input

type="number"

name="pesoMin"

min="0"

value={formulario.pesoMin}

onChange={cambiarDato}

placeholder="Ej: 180"

className="w-full border rounded-xl p-3 mt-2"

/>


</div>



<div>


<label className="block text-sm font-bold">

Peso máximo (kg)

</label>


<input

type="number"

name="pesoMax"

min="0"

value={formulario.pesoMax}

onChange={cambiarDato}

placeholder="Ej: 250"

className="w-full border rounded-xl p-3 mt-2"

/>


</div>


</div>


</div>





{/* PRESUPUESTO */}

<div className="mt-6">


<h2 className="font-bold text-green-700">

Presupuesto

</h2>


<div className="grid md:grid-cols-2 gap-4 mt-3">


<div>


<label className="block text-sm font-bold">

Monto máximo (Bs)

</label>


<input

type="number"

name="presupuesto"

min="0"

value={formulario.presupuesto}

onChange={cambiarDato}

placeholder="Ej: 4500"

className="w-full border rounded-xl p-3 mt-2"

/>


</div>



<div>


<label className="block text-sm font-bold">

Tipo de presupuesto

</label>


<select

name="tipoPresupuesto"

value={formulario.tipoPresupuesto}

onChange={cambiarDato}

className="w-full border rounded-xl p-3 mt-2"

>

<option value="Por cabeza">

Por cabeza

</option>

<option value="Por lote">

Por lote

</option>

<option value="Negociable">

Negociable

</option>

</select>


</div>


</div>


</div>
{/* UBICACIÓN */}

<div className="mt-6">


<h2 className="font-bold text-green-700">

Ubicación donde buscas el ganado

</h2>


<p className="text-sm text-gray-500 mt-1">

Si dejas estos campos vacíos, se utilizará la ubicación de tu perfil.

</p>


<label className="block font-bold mt-4">

Departamento

</label>


<select

name="departamento"

value={formulario.departamento}

onChange={cambiarDato}

className="w-full border rounded-xl p-3 mt-2"

>

<option value="">

Usar ubicación de mi perfil

</option>

<option value="Santa Cruz">

Santa Cruz

</option>

<option value="Cochabamba">

Cochabamba

</option>

<option value="La Paz">

La Paz

</option>

<option value="Beni">

Beni

</option>

<option value="Pando">

Pando

</option>

<option value="Chuquisaca">

Chuquisaca

</option>

<option value="Tarija">

Tarija

</option>

<option value="Oruro">

Oruro

</option>

<option value="Potosí">

Potosí

</option>

</select>




<div className="grid md:grid-cols-2 gap-4 mt-4">


<div>


<label className="block font-bold">

Provincia

</label>


<input

type="text"

name="provincia"

value={formulario.provincia}

onChange={cambiarDato}

placeholder="Ej: Vallegrande"

className="w-full border rounded-xl p-3 mt-2"

/>


</div>



<div>


<label className="block font-bold">

Municipio

</label>


<input

type="text"

name="municipio"

value={formulario.municipio}

onChange={cambiarDato}

placeholder="Ej: Vallegrande"

className="w-full border rounded-xl p-3 mt-2"

/>


</div>


</div>


</div>





{/* URGENCIA */}

<label className="block font-bold mt-6">

¿Cuándo necesitas comprar?

</label>


<select

name="urgencia"

value={formulario.urgencia}

onChange={cambiarDato}

className="w-full border rounded-xl p-3 mt-2"

>

<option value="Sin urgencia">

Sin urgencia

</option>

<option value="Compra inmediata">

Compra inmediata

</option>

<option value="Esta semana">

Esta semana

</option>

<option value="Este mes">

Este mes

</option>

</select>





{/* DESCRIPCIÓN */}

<label className="block font-bold mt-6">

Descripción adicional

</label>


<textarea

name="descripcion"

value={formulario.descripcion}

onChange={cambiarDato}

rows="5"

placeholder="Ej: Busco animales en buen estado. Puedo coordinar transporte. Preferentemente ganado de la zona..."

className="w-full border rounded-xl p-3 mt-2"

/>





{/* INFORMACIÓN */}

<div className="bg-green-50 border border-green-200 rounded-2xl p-4 mt-6">


<p className="font-bold text-green-800">

Tu información de contacto

</p>


<p className="text-sm text-gray-600 mt-1">

El número de teléfono registrado en tu cuenta se utilizará para que los productores puedan contactarte.

</p>


</div>





{/* ERROR */}

{error && (

<div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mt-5">

{error}

</div>

)}





{/* PUBLICAR */}

<button

type="button"

onClick={publicarSolicitud}

disabled={publicando}

className="w-full bg-green-700 text-white p-4 rounded-xl mt-7 font-bold disabled:opacity-50"

>

{

publicando

?

"Publicando solicitud..."

:

"Publicar solicitud de compra"

}

</button>





{/* CANCELAR */}

<button

type="button"

onClick={()=>navigate("/")}

disabled={publicando}

className="w-full border-2 border-green-700 text-green-700 p-4 rounded-xl mt-3 font-bold"

>

Cancelar

</button>



</div>


</div>


</div>

)

}


export default PublicarSolicitud