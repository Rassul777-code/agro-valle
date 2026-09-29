import {
useState
} from "react"

import {
useNavigate
} from "react-router-dom"

import {
supabase
} from "../supabase/client"



function RegistroGanaderia(){


const navigate=useNavigate()



const [datos,setDatos]=useState({

nombreGanaderia:"",
tipoProductor:"",
tipoGanado:"",
cantidad:"",
razas:""

})



const [foto,setFoto]=useState("")

const [error,setError]=useState("")

const [cargando,setCargando]=useState(false)





const usuarioGuardado=

localStorage.getItem(
"usuarioAgroValle"
)



const usuario=

usuarioGuardado

?

JSON.parse(usuarioGuardado)

:

null





function cambiarDato(e){


const {

name,

value

}=e.target



setDatos({

...datos,

[name]:value

})


}





function cargarFoto(e){


const archivo=

e.target.files[0]



if(!archivo){

return

}



const lector=

new FileReader()



lector.onload=()=>{


setFoto(
lector.result
)


}



lector.readAsDataURL(archivo)



}







async function guardarRegistro(){


setError("")



if(!usuario){


setError(

"No encontramos tus datos personales. Vuelve al registro."

)


return

}





if(

!datos.nombreGanaderia ||

!datos.tipoProductor ||

!datos.tipoGanado

){


setError(

"Completa el nombre de la ganadería, tipo de productor y tipo de ganado."

)


return

}





setCargando(true)





try{



const {

error:updateError

}=await supabase


.from("perfiles")


.update({


nombre_ganaderia:

datos.nombreGanaderia,



tipo_productor:

datos.tipoProductor,



tipo_ganado:

datos.tipoGanado,



cantidad_animales:

datos.cantidad,



razas_principales:

datos.razas,



foto_ganaderia:

foto



})


.eq(

"auth_id",

usuario.authId

)







if(updateError){



console.log(
updateError
)



setError(

"No se pudieron guardar los datos de la ganadería."

)



setCargando(false)



return

}





const usuarioActualizado={


...usuario,


nombreGanaderia:

datos.nombreGanaderia,



tipoProductor:

datos.tipoProductor,



tipoGanado:

datos.tipoGanado,



cantidadAnimales:

datos.cantidad,



razasPrincipales:

datos.razas,



fotoGanaderia:

foto



}






localStorage.setItem(

"usuarioAgroValle",

JSON.stringify(usuarioActualizado)

)





setCargando(false)



navigate("/publicar-ganado")





}catch(errorGeneral){



console.log(
errorGeneral
)



setError(

"Ocurrió un error al guardar la información."

)



setCargando(false)



}



}
return(

<div className="min-h-screen bg-green-50 p-6">


<div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8">


<h1 className="text-3xl font-bold text-green-700">

Datos de la ganadería

</h1>


<p className="text-gray-600 mt-2">

Completa la información de tu producción

</p>





<input

name="nombreGanaderia"

value={datos.nombreGanaderia}

onChange={cambiarDato}

className="w-full border rounded-xl p-3 mt-6"

placeholder="Nombre de la finca o empresa"

/>





<select

name="tipoProductor"

value={datos.tipoProductor}

onChange={cambiarDato}

className="w-full border rounded-xl p-3 mt-4"

>

<option value="">

Tipo de productor

</option>


<option value="Ganadero independiente">

Ganadero independiente

</option>


<option value="Empresa ganadera">

Empresa ganadera

</option>


</select>






<select

name="tipoGanado"

value={datos.tipoGanado}

onChange={cambiarDato}

className="w-full border rounded-xl p-3 mt-4"

>


<option value="">

Tipo de ganado principal

</option>


<option value="Bovino">

Bovino

</option>


<option value="Ovino">

Ovino

</option>


<option value="Caprino">

Caprino

</option>


<option value="Mixto">

Mixto

</option>


</select>






<input

name="cantidad"

value={datos.cantidad}

onChange={cambiarDato}

type="number"

min="0"

className="w-full border rounded-xl p-3 mt-4"

placeholder="Cantidad aproximada de animales"

/>





<input

name="razas"

value={datos.razas}

onChange={cambiarDato}

className="w-full border rounded-xl p-3 mt-4"

placeholder="Razas principales (Ej: Nelore, Gyr, Brangus)"

/>








<h2 className="font-bold text-gray-700 mt-6">

Ubicación de la ganadería

</h2>





<div className="bg-green-50 rounded-xl p-5 mt-3">


<p className="text-gray-700">

<strong>

Departamento:

</strong>{" "}

{usuario?.departamento || "No especificado"}

</p>



<p className="text-gray-700 mt-2">

<strong>

Provincia:

</strong>{" "}

{usuario?.provincia || "No especificada"}

</p>



<p className="text-gray-700 mt-2">

<strong>

Municipio:

</strong>{" "}

{usuario?.municipio || "No especificado"}

</p>



</div>






<div className="border-2 border-dashed border-green-600 rounded-xl p-5 mt-5 text-center">


<p className="font-bold text-green-700">

Foto de la ganadería

</p>



<input

type="file"

accept="image/*"

onChange={cargarFoto}

className="mt-3"

/>





{foto && (

<img

src={foto}

alt="Ganadería"

className="w-full h-48 object-cover rounded-xl mt-4"

/>

)}



</div>







{error && (

<div className="bg-red-50 text-red-700 p-4 rounded-xl mt-5">

{error}

</div>

)}







<button

type="button"

onClick={guardarRegistro}

disabled={cargando}

className="w-full bg-green-700 text-white p-4 rounded-xl mt-5 font-bold disabled:opacity-50"

>


{

cargando

?

"Guardando..."

:

"Guardar registro"

}


</button>







<button

type="button"

onClick={()=>navigate("/registro")}

disabled={cargando}

className="w-full border-2 border-green-700 text-green-700 p-4 rounded-xl mt-3 font-bold"

>

Volver

</button>





</div>


</div>

)

}


export default RegistroGanaderia