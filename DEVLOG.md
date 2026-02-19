

# 📂 DEVLOG #1: El Nacimiento de Argos (Frontend & Backend Seguro)

**Fecha:** 18 de Febrero de 2026
**Proyecto:** Argos Dance Academy Management System

## 🎯 Objetivo General

Iniciar el desarrollo de **Argos**, una plataforma integral (ERP) para la gestión de una academia de ballet. El sistema debe resolver problemas operativos (pagos, horarios, calificaciones) y ofrecer una imagen profesional.
**Enfoque clave:** Seguridad desde el diseño (Security by Design), escalabilidad y experiencia de usuario (UX) elegante.

---

## 🛠️ 1. Frontend: La Cara de la Academia

**Tecnologías:** React, Vite, Tailwind CSS v4, Lucide React, React Router.

### ¿Qué se hizo?

* **Setup del Proyecto:** Migramos de `create-react-app` a **Vite** para un entorno de desarrollo instantáneo.
* **Estilos Modernos:** Implementamos **Tailwind CSS v4** (la versión más nueva), configurando variables CSS nativas para los colores de marca (`--color-argos-gold`, `--color-argos-dark`) y tipografías (`Playfair Display` para elegancia, `Inter` para legibilidad).
* **Arquitectura de Navegación:** Configuramos `react-router-dom` para separar la *Landing Page* pública del *Login* privado.
* **Landing Page de Alto Impacto:**
* Diseñamos un **Hero Carousel** con `react-slick` para mostrar la estética del ballet.
* Creamos secciones modulares: *Membresías* (con efectos interactivos de selección), *Horarios* y *Accesos al Portal*.


* **Login "Bulletproof":**
* Diseñamos una interfaz limpia: Tarjeta blanca flotante sobre fondo fotográfico oscuro.
* **Solución de UI:** Resolvimos conflictos de superposición (z-index y padding) en los inputs usando estilos en línea para garantizar que los iconos (correo, candado, ojo) no bloquearan el texto del usuario.



### 💡 ¿Por qué?

Una academia de arte vende estética. Una interfaz fea o rota genera desconfianza. Usamos **React** para hacer una *Single Page Application* (SPA) rápida y **Tailwind** para iterar el diseño sin escribir cientos de líneas de CSS tradicional.

---

## 🔐 2. Backend: El Búnker (Ciberseguridad & Datos)

**Tecnologías:** Node.js, Express, PostgreSQL, Bcrypt, JWT, Kali Linux.

### ¿Qué se hizo?

* **Entorno de Desarrollo:** Configuramos el servidor de base de datos **PostgreSQL** directamente en **Kali Linux**.
* *Reto superado:* Solucionamos un error de colisión de versiones (`glibc`) típico de sistemas *Rolling Release* mediante `REFRESH COLLATION`.


* **Diseño de Base de Datos (Schema):**
* Creamos tablas relacionales: `users`, `courses`, `enrollments`, `payments`.
* **Seguridad:** En lugar de IDs numéricos (1, 2, 3), implementamos **UUIDs** (`uuid-ossp`) para prevenir ataques de enumeración (IDOR).


* **Script de Inicialización:** Creamos `scripts/init_db.js` para automatizar la creación de tablas. Esto hace que el proyecto sea portable a cualquier servidor.
* **Gestión de Identidad (Auth):**
* Implementamos **Bcrypt** para hashear contraseñas (Salt rounds: 10). Nunca guardamos texto plano.
* Creamos un `seed_admin.js` para inyectar el primer usuario administrador de forma segura.


* **API REST:**
* Levantamos un servidor **Express** con estructura MVC (Controlador-Ruta-Servicio).
* Creamos el endpoint `/api/auth/login` que recibe credenciales, verifica el hash y devuelve un **JWT (JSON Web Token)**.



### 💡 ¿Por qué?

Como el objetivo es aprender ciberseguridad:

1. **Postgres en Kali:** Nos obliga a entender permisos de Linux y configuración de servicios reales.
2. **UUIDs & Hashing:** Son estándares de la industria para evitar fugas de datos masivas.
3. **JWT:** Permite que la sesión del usuario sea "stateless" (sin guardar estado en memoria del servidor), lo que facilita escalar a miles de usuarios si el negocio crece.

---

## 🚀 Próximos Pasos

* Conectar el **Frontend** (Login) con el **Backend** real para obtener el Token.
* Crear el **Dashboard** (Panel de Control) protegido para Alumnas y Admin.
* Documentar la API con **Swagger**.

---

**Estado del Proyecto:** 🟢 Backend funcional / 🟡 Frontend en integración.

---

# 📂 DEVLOG #2: La Gran Conexión (Integración Frontend-Backend)

**Fecha:** 18 de Febrero de 2026
**Estado:** ✅ Sistema Fullstack Operativo

## 🎯 Logro Principal

Conectamos el "Cerebro" (Backend en Node/Kali) con el "Cuerpo" (Frontend en React). Ahora, el Login es real: valida credenciales contra la base de datos PostgreSQL, recibe un Token de seguridad y da acceso al Dashboard.

---

## 🛠️ Desafíos Técnicos & Soluciones

### 1. El Error de "Sincronización en React"

* **El Problema:** Al cargar el Dashboard, React lanzaba el error: `Error: Calling setState synchronously within an effect...`.
* **La Causa:** Estábamos intentando leer el `localStorage` y actualizar el estado (`setUser`) dentro de un `useEffect` justo cuando la página se estaba pintando. React odia eso porque causa parpadeos (re-renders innecesarios).
* **La Solución (Pro Tip):** Implementamos **"Lazy Initialization"** (Inicialización Perezosa).
* *Antes:* `useState(null)` + `useEffect(() => setUser(...))` ❌
* *Después:* `useState(() => JSON.parse(localStorage.getItem('user')))` ✅
* *Por qué:* Ahora React lee el usuario **antes** de pintar el primer píxel. Es más rápido y elimina el error.



### 2. Persistencia de Sesión

* **Mecanismo:** Usamos `localStorage` para guardar el JWT (`token`) y los datos del usuario (`user`).
* **Seguridad:** El Dashboard verifica si estos datos existen al cargar. Si no hay token, te patea de regreso al Login (`Maps('/login')`).

---

## 💻 HOJA DE TRUCOS: Comandos de Operación

*Para levantar el sistema completo, necesito dos terminales abiertas simultáneamente.*

### TERMINAL 1: El Backend (Puerto 3000)

Es el servidor que habla con la base de datos.

```bash
cd ~/Proyecto/argos/argos-backend
node src/index.js

```

* **Salida Esperada:** `🚀 Servidor Backend corriendo en http://localhost:3000`
* **¿Por qué este puerto?** Es el estándar para servidores Express/Node. Si este puerto está cerrado, el Frontend dará error de "Network Error".

### TERMINAL 2: El Frontend (Puerto 5173)

Es la interfaz gráfica que ve el usuario.

```bash
cd ~/Proyecto/argos/argos-frontend
npm run dev

```

* **Salida Esperada:** `VITE v4.x.x  ready in x ms` -> `➜ Local: http://localhost:5173/`
* **¿Por qué este puerto?** Vite usa el 5173 por defecto (React clásico usaba el 3000, por eso usamos Vite para evitar choques con el backend).

---

## 🕵️‍♂️ Verificación Manual (Modo Hacker)

Si la página web falla, usamos estos comandos en una tercera terminal para saber si la culpa es del Frontend o del Backend.

### 1. Prueba de Salud (Ping al Login)

Intentamos loguearnos manualmente sin usar la página web.

```bash
curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@argos.com", "password": "AdminSeguro2026!"}'

```

* **Resultado esperado:** Un JSON con `"message": "Login exitoso"` y un `"token": "eyJ..."`.
* **¿Qué prueba esto?** Que Node.js, Postgres y Bcrypt funcionan perfectamente.

### 2. Prueba de Acceso Seguro (Usando el Token)

Copiamos el token del paso anterior y probamos la ruta protegida `/me`.

```bash
curl -H "Authorization: Bearer PEGA_TU_TOKEN_AQUI" http://localhost:3000/api/auth/me

```

* **Resultado esperado:** `{"message": "¡Esta es información secreta!", ...}`
* **¿Qué prueba esto?** Que el Middleware (el cadenero) está validando correctamente la firma digital del Token.

---

## 📝 Siguientes Pasos

Ahora que el sistema "camina", vamos a enseñarle a trabajar:

1. Crear el CRUD de **Clases** (Backend).
2. Diseñar la pantalla para ver y agregar clases en el Dashboard (Frontend).


# 📂 DEVLOG #3: La Economía de Argos (Créditos y Clases)

**Fecha:** 18 de Febrero de 2026
**Estado:** ✅ Backend Transaccional & Gestión Fullstack

## 🚀 Resumen del Hito

El sistema ha dejado de ser solo un login. Hoy implementamos el núcleo del negocio: un **modelo basado en créditos** (tipo ClassPass/Gimnasio). Ahora el Administrador puede gestionar el inventario (Clases), los clientes (Alumnos) y la moneda de cambio (Créditos).

---

## ⚙️ Cambios Técnicos Mayores

### 1. Evolución del Esquema de Base de Datos (Migrations)

Tuvimos que alterar la estructura original para soportar el nuevo modelo de negocio.

* **Script de Migración:** Creamos `update_schema.js` para alterar tablas vivas sin perder datos.
* **Desafío UUID:** Nos enfrentamos a un error de tipos (`Integer` vs `UUID`) al crear las relaciones foráneas. Se solucionó estandarizando todo a `UUID`.
* **Nuevas Columnas:**
* `users.credits` (Integer): El "monedero" del alumno.
* `courses.capacity` (Integer): El cupo máximo de la clase.
* `bookings` (Tabla): Relación N:M que guarda quién va a qué clase y cuándo.



### 2. Lógica Transaccional (ACID)

Implementamos la función más crítica del sistema: **Reservar Clase**.
Usamos transacciones de PostgreSQL (`BEGIN`, `COMMIT`, `ROLLBACK`) para asegurar la integridad de los datos.

* **El Flujo Atómico:**
1. Verificar saldo del usuario.
2. Verificar aforo de la clase para esa fecha específica.
3. Insertar reserva en `bookings`.
4. Restar 1 crédito al usuario.


* *Si cualquiera de estos pasos falla, la base de datos deshace todo automáticamente.*

### 3. Seguridad: Auditoría Anti-SQL Injection 🛡️

Realizamos pruebas de penetración manuales usando `curl` contra el endpoint de Login.

* **Vector de Ataque:** Inyección de `' OR '1'='1` en el campo de email.
* **Resultado:** El ataque falló exitosamente.
* **Razón:** El uso de *Parameterized Queries* (`$1`, `$2`) en la librería `pg` sanitiza las entradas nativamente, tratando el código malicioso como simples cadenas de texto.

---

## 🎨 Frontend & DX (Developer Experience)

### Gestión de Usuarios y Clases

Creamos dos componentes robustos en React:

* `UsersTable.jsx`: Permite crear Alumnos y Maestros. Muestra saldo de créditos.
* `CoursesTable.jsx`: Permite crear clases asignando maestros y costos.

### "Modo Desarrollador" en UI

Como aún no tenemos todas las pantallas finales, agregamos herramientas de diagnóstico visuales:

* **Copy-to-Clipboard:** Botones para copiar los IDs (UUIDs) de usuarios y clases directamente desde la tabla. Esto facilita el uso de herramientas de terminal (`curl`) para pruebas rápidas.
* **Manejo de Estados:** Implementación correcta de `loading` states y limpieza de errores de Linter (ESLint) para un código limpio.

---

## 🛠️ Hoja de Trucos: Comandos Operativos

### 1. Recargar Créditos (Simulación de Pago)

Como aún no hay pasarela de pagos (Stripe), el Admin actúa como el banco.
*Necesitas el ID del alumno (copiar desde el Dashboard).*

```bash
curl -X PUT http://localhost:3000/api/users/PEGAR_ID_AQUI/credits \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TU_TOKEN_ADMIN" \
     -d '{"amount": 10}'

```

### 2. Reservar una Clase (Simulación de Alumno)

*Necesitas el ID de la clase y el token de una alumna (o admin).*

```bash
curl -X POST http://localhost:3000/api/bookings \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN" \
     -d '{
           "courseId": "PEGAR_ID_CLASE_AQUI",
           "classDate": "2026-02-20"
         }'

```

---

## 🔮 Siguientes Pasos

1. Crear la vista de **"Mi Perfil"** para que la alumna vea sus créditos y su historial.
2. Crear la interfaz visual de **"Calendario de Reservas"** para que no tengan que usar `curl`.

---

## 📝 DevLog #4: Refactorización del Núcleo y Experiencia de Usuario (UX)

### **Resumen de la Fase**

En esta etapa, el proyecto **Argos** dejó de ser un simple catálogo para convertirse en un sistema de gestión integral. Se eliminó la lógica de costos individuales por clase para migrar a un modelo de **Membresías**, centrando la experiencia del usuario en un calendario interactivo y eliminando fricciones visuales.

---

### **1. Desafíos Técnicos y Soluciones**

* **Sincronización de Datos (Backend Joins):** Se implementó un `LEFT JOIN` en PostgreSQL para que el catálogo de clases entregue el nombre del maestro directamente desde la tabla de usuarios. Esto optimizó el rendimiento al evitar búsquedas adicionales en el cliente.
* **Normalización de IDs:** Se resolvió un bug de persistencia forzando la comparación de identificadores como cadenas de texto (`Strings`), garantizando que la vinculación maestro-clase se mantenga tras recargar la aplicación.
* **Gestión de Estados en el Calendario:** Se diseñó una lógica de normalización de fechas (ISO 8601) para comparar las reservas de la base de datos con los días del mes actual, permitiendo que las clases reservadas se rendericen en verde de forma persistente.

---

### **2. Mejoras en la Experiencia de Usuario (UX/UI)**

* **Adiós a los Diálogos de Sistema:** Se sustituyeron los `alert()` y `confirm()` nativos por **Modales Personalizados** (`SuccessModal` y `ConfirmModal`) con efectos de desenfoque (*backdrop-blur*) y animaciones suaves, elevando la estética de la marca.
* **Feedback Visual de Créditos:** Se implementó una lógica de "Moneda Gris" y bloqueo de botones. Si una alumna no tiene saldo, el sistema deshabilita las reservas visualmente, previniendo errores antes de que ocurran.
* **Landing Page Realista:** Se actualizó la página principal con la oferta académica real de la academia, incluyendo disciplinas como Pre Ballet, Danza Contemporánea y Acondicionamiento Físico.

---

### **3. Estado Actual del MVP**

> "Tenemos un Backend de Ferrari con un Frontend de alto rendimiento." El Admin ya puede gestionar el catálogo sin tocar la terminal, y las alumnas pueden visualizar su mes completo de clases en un calendario tipo 'App de Fitness'.

---

### **4. Próximos Pasos (Roadmap)**

* **Membresías Automatizadas:** Implementar el campo `weekly_limit` en la tabla de usuarios para asignar planes de 2, 3 o 5 clases por semana.
* **Recarga Automática:** Lógica de backend para resetear créditos el día 1 de cada mes.

---
