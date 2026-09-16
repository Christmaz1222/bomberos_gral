# 📋 SIPPCI V2.1 — Análisis Completo del Sistema Legacy y Catálogos Oficiales
**Documento Técnico:** `LEGACY_ANALYSIS.md`  
**Proyecto:** SIPPCI V2.1 — Plataforma Integral de Trámites DNB  
**Fuente Legacy:** Código fuente PHP y Dump MySQL (`bomberos.sql`) en `Bomberos/`  
**Fecha de Elaboración:** 16 de Septiembre de 2026  
**Tipo:** Documentación de Arquitectura, Esquemas y Plan de Migración (Solo Documentación)

---

## 1. 📌 INTRODUCCIÓN Y OBJETIVO DEL ANÁLISIS

El sistema legacy de la Dirección Nacional de Bomberos (DNB - Policía Boliviana) operaba sobre una pila LAMP (Linux/Windows, Apache, PHP procedural, MySQL) con tablas individuales por cada trámite (`formbnd01s` a `formbnd06s`), validación manual mediante formularios de revisión (`sippci01Val.php`, `profesionales01Val.php`, etc.), emisión de reportes mediante FPDF (`reporte01.php` - `reporte05.php`) y almacenamiento local de archivos en carpetas `upload/arch/` y `doc/`.

Este documento consolida la radiografía exhaustiva de:
1. Los 6 formularios legacy, con sus nombres de campo HTML, tipos de datos MySQL y restricciones exactas.
2. Los catálogos oficiales extraídos directamente de `bomberos.sql` y su homologación a SIPPCI V2.1.
3. El esquema completo de base de datos relacional legacy (26 tablas identificadas).
4. La matriz de mapeo campo a campo entre el legacy y el nuevo modelo relacional Postgres/Prisma.
5. La estrategia de migración técnica (ETL) y normalización.
6. La matriz de brechas funcionales (Gaps) priorizadas para las siguientes fases.

---

## 2. 📝 ANÁLISIS DETALLADO DE LOS 6 FORMULARIOS LEGACY

### 01 — Formulario de Registro Certificación SIPPCI — Persona Jurídica (FORM-DNB-001)
* **Archivo PHP:** `/formularios/formbns01.php` ➔ Handler: `/formularios/upload/upload01.php`
* **Tabla MySQL:** `formbnd01s`
* **Prefijo de Código:** `SIPPCI-JUR-{rand(1,1000000)}`
* **Cuenta Bancaria Destino:** Banco Unión `10000041958478 - Policía Boliviana Bomberos`

| Campo HTML (`name`) | Columna BD (`formbnd01s`) | Tipo Legacy | Requerido | Descripción / Validación |
|---|---|---|---|---|
| `num` | `codigo` | `varchar(30)` | SÍ (Auto) | Código autogenerado con prefijo `SIPPCI-JUR-` |
| `fsolicitud` | `fecha_solicitud` | `varchar(10)` | SÍ (Auto) | Fecha actual en formato `YYYY-MM-DD` |
| `nombrers` | `nombrerz` | `varchar(100)` | SÍ | Nombre o Razón Social de la Persona Jurídica |
| `nit` | `nit` | `int(20)` | SÍ | Número de Identificación Tributaria (NIT) |
| `oficina` | `oficina` | `varchar(100)` | SÍ | Entidad / Institución / Nombre Comercial |
| `legal` | `responsablelegal` | `varchar(100)` | SÍ | Nombre Completo del Representante Legal |
| `ci` | `ci` | `int(20)` | SÍ | Cédula de Identidad del representante |
| `expedido` | `expedido` | `varchar(10)` | SÍ | Departamento emisor del CI (`LP`, `CB`, `CRZ`, etc.) |
| `mail` | `mail` | `varchar(50)` | SÍ | Correo electrónico de contacto |
| `fono` | `telefono` | `int(10)` | SÍ | Teléfono oficina o número celular |
| `ciudad` | `ciudad` | `varchar(100)` | SÍ | Ciudad de radicación |
| `depto` | `departamento` | `varchar(100)` | SÍ | Departamento (`LA PAZ`, `SANTA CRUZ`, etc.) |
| `provincia` | `provincia` | `varchar(100)` | SÍ | Provincia de ubicación |
| `municipio` | `municipio` | `varchar(100)` | SÍ | Municipio de ubicación |
| `deposito` | `deposito` | `int(10)` | SÍ | Número de comprobante de depósito bancario |
| `fdeposito` | `fecha_deposito` | `varchar(20)` | SÍ | Fecha en que se realizó el depósito bancario |
| `obs` | `observaciones` | `text` | NO | Observaciones generales del solicitante |
| `docs` | `docs` | `varchar(100)` | SÍ | Ruta de imagen comprobante en `arch/{file}` |

---

### 02 — Formulario de Registro Certificación SIPPCI — Persona Natural (FORM-DNB-002)
* **Archivo PHP:** `/formularios/formbns02.php` ➔ Handler: `/formularios/upload/upload02.php`
* **Tabla MySQL:** `formbnd02s`
* **Prefijo de Código:** `SIPPCI-NAT-{rand(1,1000000)}`

| Campo HTML (`name`) | Columna BD (`formbnd02s`) | Tipo Legacy | Requerido | Descripción / Validación |
|---|---|---|---|---|
| `num` | `codigo` | `varchar(30)` | SÍ (Auto) | Código autogenerado con prefijo `SIPPCI-NAT-` |
| `fecha` | `fecha_solicitud` | `varchar(10)` | SÍ (Auto) | Fecha actual `YYYY-MM-DD` |
| `ci` | `cedula` | `int(20)` | SÍ | Cédula de Identidad del solicitante natural |
| `expedido` | `expedido` | `varchar(10)` | SÍ | Abrev. departamento de expedición (`LP`, `OR`, etc.) |
| `mail` | `mail` | `varchar(50)` | SÍ | Correo electrónico |
| `telefono` | `telefono` | `int(10)` | SÍ | Teléfono / Celular |
| `ciudad` | `ciudad` | `varchar(100)` | SÍ | Ciudad |
| `departamento` | `departamento` | `varchar(50)` | SÍ | Nombre del Departamento |
| `provincia` | `provincia` | `varchar(100)` | SÍ | Provincia |
| `municipio` | `municipio` | `varchar(100)` | SÍ | Municipio |
| `deposito` | `deposito` | `int(10)` | SÍ | Número de comprobante bancario |
| `fdeposito` | `fecha_deposito` | `varchar(10)` | SÍ | Fecha de depósito bancario |
| `observaciones` | `observaciones` | `text` | NO | Observaciones del solicitante |
| `docs` | `docs` | `varchar(100)` | SÍ | Imagen del comprobante de depósito en `arch/` |

---

### 03 — Formulario de Registro Profesionales SIPPCI — Persona Jurídica (FORM-DNB-003)
* **Archivo PHP:** `/formularios/formbns03.php` ➔ Handler: `/formularios/upload/upload03.php`
* **Tabla MySQL:** `formbnd03s`
* **Prefijo de Código:** `REGPROF-JUR-{rand(1,1000000)}`

| Campo HTML (`name`) | Columna BD (`formbnd03s`) | Tipo Legacy | Requerido | Descripción / Validación |
|---|---|---|---|---|
| `num` | `codigo` | `varchar(30)` | SÍ (Auto) | Prefijo `REGPROF-JUR-` |
| `fecha` | `fecha_solicitud` | `varchar(15)` | SÍ (Auto) | Fecha actual |
| `nombrerz` | `nombrerz` | `varchar(100)` | SÍ | Razón Social de la Empresa consultora |
| `nit` | `nit` | `int(20)` | SÍ | NIT de la Empresa |
| `oficina` | `oficina` | `varchar(100)` | SÍ | Nombre de la entidad u oficina técnica |
| `legal` | `responsablelegal` | `varchar(100)` | SÍ | Representante Legal de la empresa |
| `cedula` | `cedula` | `int(20)` | SÍ | CI del Representante Legal |
| `expedido` | `expedido` | `varchar(10)` | SÍ | Expedición CI Representante |
| `mail` | `mail` | `varchar(100)` | SÍ | Correo Electrónico institucional |
| `telefono` | `telefono` | `int(10)` | SÍ | Teléfono institucional |
| `ciudad` | `ciudad` | `varchar(100)` | SÍ | Ciudad |
| `departamento` | `departamento` | `varchar(50)` | SÍ | Departamento |
| `provincia` | `provincia` | `varchar(100)` | SÍ | Provincia |
| `municipio` | `municipio` | `varchar(100)` | SÍ | Municipio |
| `ncprofesional` | `ncprofesional` | `varchar(100)` | SÍ | **Nombre Completo del Profesional acreditado** |
| `ciprofesional` | `ciprofesional` | `int(20)` | SÍ | **Número de CI del Profesional acreditado** |
| `carrera` | `carrera` | `varchar(100)` | SÍ | **Carrera / Especialidad (Ej: Ingeniería Industrial)** |
| `educacion` | `educacion` | `varchar(100)` | SÍ | **Nivel de Educación (Select `neducacion`)** |
| `deposito` | `deposito` | `int(20)` | SÍ | Número de depósito bancario |
| `fdeposito` | `fecha_deposito` | `varchar(10)` | SÍ | Fecha de depósito bancario |
| `observaciones` | `observaciones` | `text` | NO | Observaciones |
| `docs` | `docs` | `varchar(100)` | SÍ | Comprobante de depósito bancario |

---

### 04 — Formulario de Registro Profesionales SIPPCI — Persona Natural (FORM-DNB-04)
* **Archivo PHP:** `/formularios/formbns04.php` ➔ Handler: `/formularios/upload/upload04.php`
* **Tabla MySQL:** `formbnd04s`
* **Prefijo de Código:** `REGPROF-NAT-{rand(1,1000000)}`

| Campo HTML (`name`) | Columna BD (`formbnd04s`) | Tipo Legacy | Requerido | Descripción / Validación |
|---|---|---|---|---|
| `num` | `codigo` | `varchar(30)` | SÍ (Auto) | Prefijo `REGPROF-NAT-` |
| `fecha` | `fecha_solicitud` | `varchar(10)` | SÍ (Auto) | Fecha actual |
| `cedula` | `cedula` | `int(20)` | SÍ | CI del Profesional solicitante |
| `expedido` | `expedido` | `varchar(10)` | SÍ | Expedición CI |
| `mail` | `mail` | `varchar(100)` | SÍ | Email |
| `telefono` | `telefono` | `int(10)` | SÍ | Teléfono |
| `ciudad` | `ciudad` | `varchar(100)` | SÍ | Ciudad |
| `departamento` | `departamento` | `varchar(50)` | SÍ | Departamento |
| `provincia` | `provincia` | `varchar(100)` | SÍ | Provincia |
| `municipio` | `municipio` | `varchar(100)` | SÍ | Municipio |
| `ncprofesional` | `ncprofecional` | `varchar(100)` | SÍ | **Nombre Completo del Profesional** |
| `ciprofesional` | `ciprofesional` | `int(20)` | SÍ | **Número de CI del Profesional** |
| `carrera` | `carrera` | `varchar(100)` | SÍ | **Carrera / Especialidad** |
| `educacion` | `educacion` | `varchar(100)` | SÍ | **Nivel de Educación (Select `neducacion`)** |
| `deposito` | `deposito` | `int(10)` | SÍ | Número de depósito bancario |
| `fdeposito` | `fecha_deposito` | `varchar(10)` | SÍ | Fecha de depósito bancario |
| `observaciones` | `observaciones` | `text` | NO | Observaciones |
| `docs` | `docs` | `varchar(100)` | SÍ | Comprobante de depósito |

---

### 05 — Formulario de Registro Capacitación SIPPCI — Persona Jurídica (FORM-DNB-005)
* **Archivo PHP:** `/formularios/formbns05.php` ➔ Handler: `/formularios/upload/upload05.php`
* **Tabla MySQL:** `formbnd05s`
* **Prefijo de Código:** `CAPACI-JUR-{rand(1,1000000)}`

| Campo HTML (`name`) | Columna BD (`formbnd05s`) | Tipo Legacy | Requerido | Descripción / Validación |
|---|---|---|---|---|
| `num` | `codigo` | `varchar(30)` | SÍ (Auto) | Prefijo `CAPACI-JUR-` |
| `fecha` | `fecha_solicitud` | `varchar(10)` | SÍ (Auto) | Fecha de solicitud |
| `nombrerz` | `nombrerz` | `varchar(100)` | SÍ | Razón Social de la Empresa o Institución |
| `nit` | `nit` | `int(30)` | SÍ | NIT / CI |
| `oficina` | `oficina` | `varchar(100)` | SÍ | Entidad / Institución / Dependencia |
| `legal` | `responsablelegal` | `varchar(100)` | SÍ | Responsable Legal o Representante |
| `cedula` | `cedula` | `int(20)` | SÍ | CI del Responsable |
| `expedido` | `expedido` | `varchar(10)` | SÍ | Expedición CI |
| `mail` | `mail` | `varchar(100)` | SÍ | Correo Electrónico |
| `telefono` | `telefono` | `int(10)` | SÍ | Teléfono / Celular |
| `ciudad` | `ciudad` | `varchar(50)` | SÍ | Ciudad |
| `departamento` | `departamento` | `varchar(50)` | SÍ | Departamento |
| `provincia` | `provincia` | `varchar(100)` | SÍ | Provincia |
| `municipio` | `municipio` | `varchar(100)` | SÍ | Municipio |
| `capacitacion` | `capacitacion` | `varchar(100)` | SÍ | **Tipo de Capacitación (Select `tcapacitacion`)** |
| `cantidad` | `cantidad` | `int(10)` | SÍ | **Cantidad de Participantes a capacitar** |
| `deposito` | `deposito` | `int(10)` | SÍ | Número de comprobante de depósito |
| `fdeposito` | `fecha_deposito` | `varchar(10)` | SÍ | Fecha del depósito |
| `observaciones` | `observaciones` | `text` | NO | Observaciones generales |
| `docs` | `docs` | `varchar(100)` | SÍ | Comprobante de depósito bancario |

---

### 06 — Formulario Único de Declaración Jurada (FORM-DNB-06)
* **Archivo PHP:** `/formularios/formbns06.php` ➔ Handler: `/formularios/upload/upload06.php`
* **Tabla MySQL:** `formbnd06s`
* **Prefijo de Código:** `DECLA-JUR-{rand(1,1000000)}`

| Campo HTML (`name`) | Columna BD (`formbnd06s`) | Tipo Legacy | Requerido | Descripción / Validación |
|---|---|---|---|---|
| `num` | `codigo` | `varchar(30)` | SÍ (Auto) | Prefijo `DECLA-JUR-` |
| `fecha` | `fecha_solicitud` | `varchar(10)` | SÍ (Auto) | Fecha actual |
| `nombrerz` | `nombrerz` | `varchar(100)` | SÍ | Nombre o Razón Social |
| `nit` | `nit` | `int(10)` | SÍ | NIT |
| `ciudad` | `ciudad` | `varchar(50)` | SÍ | Ciudad |
| `direccion` | `direccion` | `varchar(100)` | SÍ | Dirección exacta de la oficina o planta |
| `legal` | `responsablelegal` | `varchar(100)` | SÍ | Nombre del Responsable Legal |
| `ciresponsable` | `ciresponsable` | `int(20)` | SÍ | CI del Responsable Legal |
| `departamento` | `departamento` | `varchar(50)` | SÍ | Departamento |
| `provincia` | `provincia` | `varchar(100)` | SÍ | Provincia |
| `municipio` | `municipio` | `varchar(100)` | SÍ | Municipio |
| `telefono` | `telefono` | `int(10)` | SÍ | Teléfono Oficina / Celular |
| `mail` | `mail` | `varchar(100)` | SÍ | Correo Electrónico |
| `nombrepersona` | `nombre_persona` | `varchar(100)` | SÍ | **Personal que elaboró el Plan de Emergencia** |
| `nivel` | `nivel` | `varchar(50)` | SÍ | **Nivel de Riesgo (Select `nriesgo`)** |
| `tipo` | `tipo` | `varchar(50)` | SÍ | **Tipo de Infraestructura (Título 4to SIPPCI)** |
| `numoperacion` | `num_operacion` | `int(10)` | SÍ | Número de Operación Bancaria |
| `fdeposito` | `fecha_deposito` | `int(10)` | SÍ | Fecha de depósito bancario |
| `montodeposito` | `monto_deposito` | `int(10)` | SÍ | Monto Depositado en Bs |
| `docs` | `docs` | `varchar(100)` | SÍ | Comprobante / Fotografía de la boleta |

---

## 3. 🗂️ CATÁLOGOS OFICIALES LEGACY VS PROPUESTA SIPPCI V2.1

### 3.1 Catálogo `departamento` / `expedido`
Extraído directamente de la tabla `departamento`:

| ID (`id_departamento`) | Descripción Legacy (`descripcion`) | Abreviación Oficial (`abrev`) | Homologación V2.1 (Código ISO / estándar) |
|---|---|---|---|
| 1 | `LA PAZ` | `LP` | `LP` (La Paz) |
| 2 | `ORURO` | `OR` | `OR` (Oruro) |
| 3 | `POTOSI` | `PT` | `PT` (Potosí) |
| 4 | `TARIJA` | `TJ` | `TJ` (Tarija) |
| 5 | `CHUQUISACA` | `CH` | `CH` (Chuquisaca) |
| 6 | `COCHABAMBA` | `CB` | `CB` (Cochabamba) |
| 7 | `SANTA CRUZ` | `CRZ` | `SC` / `CRZ` (Santa Cruz) |
| 8 | `BENI` | `BN` | `BE` / `BN` (Beni) |
| 9 | `PANDO` | `PD` | `PD` (Pando) |

*Recomendación V2.1:* Mantener `descripcion` completa en reportes y aceptar tanto `CRZ` como `SC`, `BN` como `BE` para máxima compatibilidad con frontend y SEGIP.

---

### 3.2 Catálogo `neducacion` (Nivel de Educación)
Extraído de la tabla `neducacion`:

| ID (`id_neducacion`) | Valor Legacy en BD | Propuesta Ampliada V2.1 |
|---|---|---|
| 1 | `Tecnico Medio` | `TECNICO_MEDIO` ("Técnico Medio") |
| 2 | `Tecnico Superior` | `TECNICO_SUPERIOR` ("Técnico Superior") |
| 3 | `Licenciatura` | `LICENCIATURA` ("Licenciatura - Grado Profesional") |
| *Nuevo* | — | `MAESTRIA` ("Maestría / Posgrado") |
| *Nuevo* | — | `DOCTORADO` ("Doctorado / Ph.D.") |
| *Nuevo* | — | `OTRO` ("Otro Nivel de Formación") |

---

### 3.3 Catálogo `nriesgo` (Nivel de Riesgo para Declaraciones Juradas)
Extraído de la tabla `nriesgo`:

| ID (`id_nriesgo`) | Valor Legacy en BD | Homologación V2.1 | Criterio SIPPCI |
|---|---|---|---|
| 1 | `Bajo` | `BAJO` | Carga de fuego baja (< 160 MJ/m²) |
| 2 | `Mediano` | `MEDIO` / `MEDIANO` | Carga de fuego media (160 - 340 MJ/m²) |
| 3 | `Alto` | `ALTO` | Carga de fuego alta (> 340 MJ/m² o químicos) |
| *Propuesto* | — | `EXTREMO` | Riesgo crítico o pirotecnia/explosivos |

---

### 3.4 Catálogo `tcapacitacion` (Tipos de Cursos de Capacitación)
Extraído de la tabla `tcapacitacion`:

| ID (`id_capacitacion`) | Código | Descripción Oficial Legacy | Homologación V2.1 |
|---|---|---|---|
| 1 | 1 | `Prev. Prote. Incen. Manejo de Extintores` | `MANEJO_EXTINTORES` |
| 2 | 2 | `Primeros Auxilios` | `PRIMEROS_AUXILIOS` |
| 3 | 3 | `Trabajo en Altura` | `TRABAJO_EN_ALTURA` |
| 4 | 4 | `Procedimientos en Evacuación` | `EVACUACION` |
| *Nuevo* | 5 | — | `MATERIALES_PELIGROSOS` ("Manejo de MatPel") |
| *Nuevo* | 6 | — | `BRIGADAS_EMERGENCIA` ("Formación de Brigadas") |
| *Nuevo* | 7 | — | `SISTEMAS_FIJOS_EXTINCION` ("Sistemas de Rociadores") |

---

### 3.5 Catálogo `oficnas` (Direcciones Departamentales y Nacional)
Extraído de la tabla `oficnas`:

| ID (`id_oficinas`) | Código | Descripción Oficial Legacy |
|---|---|---|
| 1 | 1 | `DIRECCION NACIONAL` |
| 2 | 2 | `DIRECCION DEPARTAMENTAL LA PAZ ` |
| 3 | 3 | `DIRECCION DEPARTAMENTAL ORURO` |
| 4 | 4 | `DIRECCION DEPARTAMENTAL POTOSI` |
| 5 | 5 | `DIRECCION DEPARTAMENTAL TARIJA` |
| 6 | 6 | `DIRECCION DEPARTAMENTAL CHUQUISACA` |
| 7 | 7 | `DIRECCION DEPARTAMENTAL SANTA CRUZ` |
| 8 | 8 | `DIRECCION DEPARTAMENTAL COCHABAMBA` |
| 9 | 9 | `DIRECCION DEPARTAMENTAL BENI` |
| 10 | 10 | `DIRECCION DEPARTTAMENTAL PANDO` |

---

### 3.6 Catálogo `grado` (Escalafón y Jerarquía Policial DNB)
Extraído de la tabla `grado`:

| ID (`id_grado`) | Nombre Completo | Abreviación Oficial |
|---|---|---|
| 1 | Coronel | `CNL` / `Cnl.` |
| 2 | Teniente Coronel | `TCNL` / `Tcnl.` |
| 3 | Mayor | `My` / `My.` |
| 4 | Capitán | `Cap` / `Cap.` |
| 5 | Teniente | `Tte` / `Tte.` |
| 6 | Sub Teniente | `Sbtte` / `Sbtte.` |
| 7 | Sub Oficial Superior | `Sof. Of. sup.` |
| 8 | Sub Oficial Mayor | `Sof. Of. My` |
| 9 | Sub Oficial Primero | `Sof. Of. 1ro` / `SOF.1RO.` |
| 10 | Sub Oficial Segundo | `Sof. Of. 2do` / `SOF. 2DO.` |
| 11 | Sargento Mayor | `Sgto. My.` |
| 12 | Sargento Primero | `Sgto. 1ro` / `SGTO 1RO.` |
| 13 | Sargento Segundo | `Sgto. 2do` / `SGTO.2DO` |
| 14 | Sargento | `Sgto` / `SGTO.` |

---

## 4. 🗄️ ESQUEMA DE BASE DE DATOS LEGACY COMPLETO (`bomberos.sql`)

### 4.1 Tablas de Formularios Ciudadanos
* `formbnd01s`: 18 columnas. Certificación SIPPCI Persona Jurídica.
* `formbnd02s`: 14 columnas. Certificación SIPPCI Persona Natural.
* `formbnd03s`: 22 columnas. Registro de Profesionales Persona Jurídica.
* `formbnd04s`: 17 columnas. Registro de Profesionales Persona Natural.
* `formbnd05s`: 20 columnas. Capacitación Persona Jurídica.
* `formbnd06s`: 19 columnas. Declaración Jurada Única.

### 4.2 Tablas de Validación y Checklist de Requisitos (Dashboard de Bomberos)
* `validacioncpn` (Validación Certificación Persona Natural):
  * Columnas: `id_vcpn`, `ci`, `formulario`, `plano`, `plan`, `licencia`, `carnet`, `boleta`, `archivo`
* `validacionvcpj` (Validación Certificación Persona Jurídica):
  * Columnas: `id_vcpj`, `nit`, `formulario`, `plano`, `plan`, `licencia`, `carnet`, `poder`, `boleta`, `archivo`
* `validacionrppn` (Validación Registro Profesional Persona Natural):
  * Columnas: `id_vrppn`, `ci`, `solicitud`, `carnet`, `direccion`, `telefono`, `nit`, `legalizada`, `boleta`, `archivo`
* `validacionrppj` (Validación Registro Profesional Persona Jurídica):
  * Columnas: `id_vrppj`, `nit`, `solicitud`, `escritura`, `poder`, `carnet`, `licfuncionamiento`, `regcomercio`, `certnit`, `titulo`, `boleta`, `archivo`

### 4.3 Tablas de Gestión de Cursos, Instrucción y Calificaciones
* `creainstructor`: Registro de instructores de bomberos (`id_instructor`, `grado`, `ci`, `pnombre`, `snombre`, `paterno`, `materno`, `oficina`, `celular`, `escalafon`).
* `crearcurso`: Catálogo de cursos ofertados (`id_curso`, `nombrecurso`, `resolucion`).
* `programarcurso`: Programación de cursos por fecha/hora/lugar (`id_programar`, `codigo_reg`, `nombrecurso`, `departamento`, `instructor`, `lugar`, `direccion`, `fecha_inicio`, `hora_inicio`, `estado`, `fregistro`, `usuario`).
* `reprogramacion`: Reprogramación de cursos suspendidos o postergados (`id_reprogramacion`, `codigo_reg`, `nombrecurso`, `lugar`, `direccion`, `fecha_repro`, `hora_repro`, `estado`, `fecha_reg`, `usuario`).
* `participantes` & `regparticipantes`: Nómina de alumnos registrados por empresa.
* `subirlista`: Almacenamiento de archivos Excel de participantes (`id_lista`, `codigo_reg`, `nombre_curso`, `departamento`, `instructor`, `archivo`, `usuario`, `fecha_reg`).
* `subirnota`: Calificaciones y estado de aprobación (`id_subir`, `codigo_reg`, `nombrecurso`, `ci`, `nombre`, `puntuacion`, `calificacion` ➔ 'APTO' / 'NO APTO').

### 4.4 Tablas de Usuarios y Personal Interno
* `personal`: Padrón de efectivos de bomberos (`id_personal`, `ci`, `grado`, `paterno`, `materno`, `pnombre`, `snombre`, `oficina`, `celular`, `escalafon`).
* `usuario`: Cuentas de acceso al sistema con login y password en texto plano (`id_usuario`, `grado`, `ci`, `pnombre`, `snombre`, `paterno`, `materno`, `oficina`, `usuario`, `pass`, `estado`, `fregistro`, `usuario_reg`).
* `habilitar` / `deshabilitar`: Historial de estados de cuenta y bloqueos de funcionarios.

---

## 5. 🔄 MATRIZ DE MAPEO DETALLADO: LEGACY ➔ SIPPCI V2.1 (POSTGRESQL / PRISMA)

El nuevo modelo SIPPCI V2.1 unifica las 6 tablas aisladas en una arquitectura normalizada compuesta por la entidad central `Solicitud` vinculada con entidades especializadas (`SippciDatos`, `DocumentoSolicitud`, `Pago`, `HistorialSolicitud`, `CertificadoHabilitacion`):

| Campo Legacy | Tabla Legacy | Modelo V2.1 (Prisma) | Columna V2.1 / Ruta JSON | Tipo V2.1 | Transformación / Regla de Negocio |
|---|---|---|---|---|---|
| `codigo` | `formbnd01s`-`06s` | `Solicitud` | `codigo` | `String (VarChar 50)` | Unificado como `SIPPCI-PJ-YYYY-NNNNN` o `SIPPCI-PN-YYYY-NNNNN` (manteniendo alias de búsqueda para códigos antiguos) |
| `fecha_solicitud` | `formbnd01s`-`06s` | `Solicitud` | `fecha_solicitud` / `created_at` | `DateTime` | Conversión de string `YYYY-MM-DD` a ISO DateTime UTC |
| *Derivado* | `formbnd01s`, `03s`, `05s`, `06s` | `Solicitud` | `tipo_persona` | `String` | `'JURIDICA'` |
| *Derivado* | `formbnd02s`, `04s` | `Solicitud` | `tipo_persona` | `String` | `'NATURAL'` |
| `nombrerz` | `formbnd01s`, `03s`, `05s`, `06s` | `Empresa` / `SippciDatos` | `Empresa.razon_social` / `datos_especificos.razon_social` | `String` | Normalización a entidad `Empresa` vinculada por `empresa_id` |
| `nit` | `formbnd01s`, `03s`, `05s`, `06s` | `Empresa` | `Empresa.nit` | `String` | Conversión de `int(20)` a `String(20)` con validación de dígito |
| `oficina` | `formbnd01s`, `03s`, `05s` | `Empresa` | `Empresa.nombre_comercial` | `String` | Nombre comercial o sucursal |
| `responsablelegal` | `formbnd01s`, `03s`, `05s`, `06s` | `Usuario` / `SippciDatos` | `datos_especificos.responsable_legal` | `String` | Datos del apoderado legal |
| `ci` / `cedula` / `ciresponsable` | `formbnd01s`-`06s` | `Usuario` | `Usuario.ci` | `String` | CI titular / solicitante |
| `expedido` | `formbnd01s`-`05s` | `Usuario` / `SippciDatos` | `datos_especificos.expedido` | `String` | Departamento emisor del CI |
| `mail` | `formbnd01s`-`06s` | `Usuario` | `Usuario.email` | `String` | Correo electrónico de notificación |
| `telefono` / `fono` | `formbnd01s`-`06s` | `Usuario` | `Usuario.telefono` | `String` | Teléfono de contacto |
| `departamento` | `formbnd01s`-`06s` | `Solicitud` / `SippciDatos` | `datos_especificos.departamento` | `String` | Departamento de la instalación |
| `provincia` | `formbnd01s`-`06s` | `Solicitud` / `SippciDatos` | `datos_especificos.provincia` | `String` | Provincia |
| `municipio` | `formbnd01s`-`06s` | `Solicitud` / `SippciDatos` | `datos_especificos.municipio` | `String` | Municipio |
| `ciudad` | `formbnd01s`-`06s` | `Solicitud` / `SippciDatos` | `datos_especificos.ciudad` | `String` | Ciudad |
| `direccion` | `formbnd06s` | `Empresa` / `SippciDatos` | `datos_especificos.direccion_oficina` | `String` | Dirección física de la infraestructura |
| `ncprofesional` / `ncprofecional` | `formbnd03s`, `04s` | `SippciDatos` | `datos_especificos.nombre_completo_profesional` | `String` | Profesional acreditado |
| `ciprofesional` | `formbnd03s`, `04s` | `SippciDatos` | `datos_especificos.ci_profesional` | `String` | CI del profesional |
| `carrera` | `formbnd03s`, `04s` | `SippciDatos` | `datos_especificos.carrera` | `String` | Carrera universitaria o técnica |
| `educacion` | `formbnd03s`, `04s` | `SippciDatos` | `datos_especificos.nivel_formacion` | `String` | Homologado con catálogo `neducacion` |
| `capacitacion` | `formbnd05s` | `CapacitacionDatos` | `datos_especificos.tipo_capacitacion` | `String` | Tipo de curso solicitado |
| `cantidad` | `formbnd05s` | `CapacitacionDatos` | `datos_especificos.cantidad_participantes` | `Int` | Número de alumnos |
| `nombre_persona` | `formbnd06s` | `SippciDatos` | `datos_especificos.nombre_personal_elaboro_plan` | `String` | Elaborador del Plan de Emergencia |
| `nivel` | `formbnd06s` | `SippciDatos` | `datos_especificos.nivel_riesgo` | `String` | Homologado con catálogo `nriesgo` |
| `tipo` | `formbnd06s` | `SippciDatos` | `datos_especificos.tipo_infraestructura` | `String` | Clasificación de infraestructura |
| `deposito` / `num_operacion` | `formbnd01s`-`06s` | `Pago` | `Pago.codigo_orden` / `nro_transaccion` | `String` | Registro en tabla `Pago` con estado `PAGO_CONFIRMADO` |
| `fecha_deposito` | `formbnd01s`-`06s` | `Pago` | `Pago.fecha_pago` | `DateTime` | Fecha efectiva de la transacción bancaria |
| `monto_deposito` | `formbnd06s` | `Pago` | `Pago.monto_bs` | `Decimal` | Monto pagado en Bolivianos |
| `docs` | `formbnd01s`-`06s` | `DocumentoSolicitud` | `ruta_archivo`, `tipo_documento` | `String` | Almacenado como documento tipo `COMPROBANTE_PAGO` con checksum SHA-256 |
| `observaciones` | `formbnd01s`-`05s` | `Solicitud` | `observacion` | `Text` | Observaciones generales del trámite |

---

## 6. 🚀 ESTRATEGIA DE MIGRACIÓN Y ETL HISTÓRICA

```
┌─────────────────────────┐         ┌───────────────────────────────┐         ┌───────────────────────────┐
│   MySQL Legacy (Source) │         │     ETL Pipeline (Node.js)    │         │  PostgreSQL V2.1 (Target) │
│                         │         │                               │         │                           │
│ - formbnd01s...06s      │ ──────> │ 1. Sanitize & Normalize       │ ──────> │ - Usuario / Empresa       │
│ - validacion*           │         │ 2. Deduplicate CI & NIT       │         │ - Solicitud (Unified)     │
│ - usuarios/personal     │         │ 3. Hash passwords (bcrypt)    │         │ - SippciDatos (JSON)      │
│ - upload/arch/ & doc/   │         │ 4. Compute SHA-256 checksums  │         │ - DocumentoSolicitud      │
│                         │         │ 5. Generate Status Timeline   │         │ - Pago                    │
└─────────────────────────┘         └───────────────────────────────┘         └───────────────────────────┘
```

### 6.1 Fases de Ejecución del ETL
1. **Extracción y Validación Previa:**
   - Exportación de las tablas `formbnd01s` a `formbnd06s` y tablas de soporte a JSON/CSV.
   - Detección de duplicados de CI y NIT, completando datos nulos con valores por defecto auditados.
2. **Transformación:**
   - Mapeo de prefijos antiguos (`SIPPCI-JUR-`, `REGPROF-NAT-`, etc.) manteniendo el código histórico en el campo `codigo` y registrando un alias para el buscador unificado.
   - Conversión de contraseñas de texto plano de la tabla `usuario` hacia hashes seguros `bcrypt` (cost 10).
   - Generación del objeto `datos_especificos` estructurado según el esquema JSON de cada submódulo.
3. **Carga y Relacionamiento:**
   - Inserción de empresas (`Empresa`) y usuarios ciudadanos (`Usuario`).
   - Inserción en tabla `Solicitud` con estado correspondiente (`APROBADO` si existe en `validacion*`, `PENDIENTE_PAGO` si solo tiene registro inicial).
   - Inserción de comprobantes en `DocumentoSolicitud` y pagos en `Pago`.
4. **Migración de Archivos Binarios:**
   - Copia de imágenes de comprobantes desde `/formularios/upload/arch/` y PDFs de `/formularios/doc/` hacia el almacenamiento centralizado V2.1 (`/uploads/comprobantes/` y `/uploads/documentos/`), calculando el checksum SHA-256 para garantizar integridad.

---

## 7. ⚖️ MATRIZ DE GAPS IDENTIFICADOS Y PRIORIZACIÓN

Al contrastar el sistema legacy completo contra SIPPCI V2.1, se identifican las siguientes funcionalidades clave para alcanzar paridad absoluta y superarla con los estándares modernos:

| # | Brecha Funcional (Gap) | Estado Legacy | Estado V2.1 Actual | Prioridad | Fase Planificada |
|---|---|---|---|---|---|
| **GAP-01** | **Checklist de Requisitos por Trámite** | Tablas `validacioncpn`, `validacionvcpj`, `validacionrppn`, `validacionrppj` (6 a 9 requisitos con checkbox) | No visible en panel de revisión admin | **ALTA** | **FASE 2** |
| **GAP-02** | **Comprobante PDF Oficial Descargable** | FPDF scripts (`reporte01.php` - `reporte05.php`) con banner institucional y datos de registro | Solo vista web | **ALTA** | **FASE 4** |
| **GAP-03** | **Consulta Pública Unificada (Buscador + QR)** | Scripts aislados de búsqueda por código y CI | Endpoint backend listo, falta UI pública con QR | **ALTA** | **FASE 5** |
| **GAP-04** | **Formularios Reales Específicos para los 6 Trámites** | 6 páginas PHP dedicadas con todos los campos | 1 formulario real listo (Submódulo 1), 8 con fallback genérico | **ALTA** | **FASE 3 & 6** |
| **GAP-05** | **Notificaciones Automáticas por Email** | Envío manual no estandarizado | Servicio `EmailService` listo en backend, falta trigger en cambio de estado | **MEDIA** | **FASE 2** |
| **GAP-06** | **Módulo de Inspección Técnica y Calificación** | Tablas `programarcurso`, `subirnota`, `habilitar` | Estructura en base de datos lista (`INSPECCION`), falta UI de asignación | **MEDIA** | **FASE 7** |

---

## 8. ✅ CONCLUSIONES Y SIGUIENTES PASOS

1. **Factibilidad de Migración:** La estructura legacy es 100% mapeable al modelo SIPPCI V2.1 sin pérdida de datos ni incompatibilidades de tipos.
2. **Catálogos Homologados:** Los catálogos de departamentos (9), niveles educativos (3+3), niveles de riesgo (3+1) y cursos de capacitación (4+3) quedan formalmente estandarizados.
3. **Paso Siguiente Inmediato:** Proceder con la **FASE 2: Checklist de Requisitos**, incorporando la matriz de validación documental en el panel administrativo de bomberos.
