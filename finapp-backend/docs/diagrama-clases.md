# Diagrama de Clases (MVC) - FinApp Backend

```mermaid
classDiagram
    %% ===== Modelos (Mongoose) =====
    class Usuario {
      +String nombre
      +String correo
      +String password
      +String rol
      +Date fechaRegistro
      +Object perfil
      +Object preferencias
      +validarPassword(password): Promise<Boolean>
    }

    class Transaccion {
      +ObjectId usuarioId
      +String tipo
      +Number monto
      +Date fecha
      +ObjectId categoriaId
      +String subcategoria
      +String metodoPago
      +String notas
      +String[] etiquetas
      +Boolean esTransferenciaInterna
      +String origen
      +String archivoCSV
    }

    class Categoria {
      +String nombre
      +String tipo
    }

    class Contenido {
      +String titulo
      +String cuerpo
      +String categoria
      +String nivel
      +String url
      +String tipo
      +String[] temas
      +String[] etiquetas
      +Object[] fuentes
      +Object quiz
      +Object[] pasos
      +Date fechaCreacion
      +Number likes
      +Number dislikes
    }

    class FeedbackContenido {
      +ObjectId usuarioId
      +ObjectId contenidoId
      +String tipo
      +Date fecha
    }

    class Meta {
      +ObjectId usuario
      +String tipo
      +Number montoObjetivo
      +Number montoActual
      +Date fechaLimite
      +Integer mes
      +Integer año
      +String estado
    }

    class Recomendacion {
      +ObjectId usuarioId
      +String area
      +String mensaje
      +Number score
      +Date fechaGeneracion
    }

    class Analisis {
      +ObjectId usuarioId
      +Object periodo
      +Object resumen
      +Object comparativo
      +Object tendencias
    }

    %% Relaciones entre Modelos (agregación/composición)
    %% Notación Mermaid: o-- agregación, *-- composición
    %% Decisiones:
    %% - Usuario *-- Transaccion : la transacción existe ligada al usuario; su ciclo de vida depende del usuario.
    %% - Usuario *-- Meta : metas son parte del dominio del usuario.
    %% - Usuario o-- Recomendacion : recomendaciones pueden ser regeneradas y no forman parte esencial del usuario.
    %% - Categoria o-- Transaccion : la transacción referencia categoría, que existe independiente.
    %% - Usuario o-- FeedbackContenido : feedback depende de usuario pero no parte esencial (puede existir otros feedbacks).
    %% - Contenido *-- FeedbackContenido : si se elimina el contenido, el feedback no tiene sentido (composición fuerte).
    Usuario "1" *-- "*" Transaccion : composición
    Usuario "1" *-- "*" Meta : composición
    Usuario "1" o-- "*" Recomendacion : agregación
    Categoria "1" o-- "*" Transaccion : agregación
    Usuario "1" o-- "*" FeedbackContenido : agregación
    Contenido "1" *-- "*" FeedbackContenido : composición

    %% ===== Controladores =====
    class AuthController {
      +register(req,res)
      +login(req,res)
      +refresh(req,res)
      +logout(req,res)
    }
    class UsuariosController {
      +crearUsuario(req,res)
      +listarUsuarios(req,res)
      +obtenerUsuario(req,res)
      +actualizarUsuario(req,res)
      +eliminarUsuario(req,res)
    }
    class TransaccionesController {
      +crearTransaccion(req,res)
      +listarPorUsuario(req,res)
      +obtenerTransaccion(req,res)
      +actualizarTransaccion(req,res)
      +eliminarTransaccion(req,res)
    }
    class CategoriasController {
      +listarCategorias(req,res)
    }
    class ContenidoController {
      +listarCapsulas(req,res)
      +obtenerCapsula(req,res)
      +buscarContenido(req,res)
      +toggleFeedback(req,res)
      +crearContenido(req,res)
      +actualizarContenido(req,res)
      +eliminarContenido(req,res)
    }
    class RecomendacionesController {
      +listarPorUsuario(req,res)
      +generar(req,res)
    }
    class AnalisisController {
      +obtenerActual(req,res)
      +obtenerHistoricoPorMesAnio(req,res)
      +generarAnalisis(req,res)
    }
    class AnalyticsController {
      +resumenUsuario(req,res)
      +serieTemporalUsuario(req,res)
      +composicionCategoriasUsuario(req,res)
      +rachaRegistroUsuario(req,res)
      +dtiUsuario(req,res)
      +variacionMensualUsuario(req,res)
      +cohortesAdmin(req,res)
      +segmentacionAdmin(req,res)
    }

    %% Controladores usan Modelos
    AuthController ..> Usuario : usa
    UsuariosController ..> Usuario : usa
    TransaccionesController ..> Transaccion : usa
    CategoriasController ..> Categoria : usa
    ContenidoController ..> Contenido : usa
    ContenidoController ..> FeedbackContenido : usa
    RecomendacionesController ..> Recomendacion : usa
    AnalisisController ..> Analisis : usa
    AnalyticsController ..> Transaccion : agrega
    AnalyticsController ..> Meta : consulta presupuesto
    AnalyticsController ..> Usuario : consulta perfil
    AnalyticsController ..> Categoria : agrega por categoría

    %% ===== Rutas (Routers) =====
    class AuthRoutes {
      +POST /api/auth/register
      +POST /api/auth/login
      +POST /api/auth/refresh
      +POST /api/auth/logout
    }
    class UsuariosRoutes {
      +GET|POST /api/usuarios
      +GET|PUT|DELETE /api/usuarios/:id
    }
    class TransaccionesRoutes {
      +POST /api/transacciones
      +GET /api/transacciones/usuario/:usuarioId
      +GET|PUT|DELETE /api/transacciones/:id
    }
    class CategoriasRoutes {
      +GET /api/categories
    }
    class ContenidoPublicRoutes {
      +GET /api/education/capsules
      +GET /api/education/capsules/:id
      +GET /api/education/search
      +POST /api/education/:id/like
    }
    class ContenidoAdminRoutes {
      +GET|POST /api/admin/content
      +PUT|DELETE /api/admin/content/:id
    }
    class RecomendacionesRoutes {
      +GET /api/recommendations/:usuarioId
      +POST /api/recommendations/generar
    }
    class AnalisisRoutes {
      +GET /api/analisis/:usuarioId
      +GET /api/analisis/:usuarioId/:mes/:anio
      +POST /api/analisis/generar
    }
    class AnalyticsRoutes {
      +GET /api/analytics/usuario/{resumen,serie,composicion,racha,dti,variacion}
      +GET /api/analytics/admin/{cohortes,segmentacion}
    }

    %% Rutas mapean a Controladores
    AuthRoutes --> AuthController
    UsuariosRoutes --> UsuariosController
    TransaccionesRoutes --> TransaccionesController
    CategoriasRoutes --> CategoriasController
    ContenidoPublicRoutes --> ContenidoController
    ContenidoAdminRoutes --> ContenidoController
    RecomendacionesRoutes --> RecomendacionesController
    AnalisisRoutes --> AnalisisController
    AnalyticsRoutes --> AnalyticsController

    %% ===== Middleware =====
    class AuthMiddleware {
      +requireAuth(req,res,next)
      +requireRole(rol)(req,res,next)
    }
    class OwnershipMiddleware {
      +ensureOwnerOrAdmin(selector)(req,res,next)
    }
    class ValidateMiddleware {
      +validate(schema)(req,res,next)
      +validateQuery(schema)(req,res,next)
      +validateParams(schema)(req,res,next)
    }

    %% Middleware intercepta Rutas
    AuthMiddleware ..> AuthRoutes
    AuthMiddleware ..> UsuariosRoutes
    AuthMiddleware ..> TransaccionesRoutes
    AuthMiddleware ..> CategoriasRoutes
    AuthMiddleware ..> ContenidoPublicRoutes
    AuthMiddleware ..> ContenidoAdminRoutes
    AuthMiddleware ..> RecomendacionesRoutes
    AuthMiddleware ..> AnalisisRoutes
    AuthMiddleware ..> AnalyticsRoutes

    OwnershipMiddleware ..> TransaccionesRoutes

    ValidateMiddleware ..> AuthRoutes
    ValidateMiddleware ..> TransaccionesRoutes
    ValidateMiddleware ..> ContenidoPublicRoutes
    ValidateMiddleware ..> ContenidoAdminRoutes
    ValidateMiddleware ..> AnalisisRoutes

    %% ===== Servicios =====
    class RecommendationEngine {
      +generarRecomendaciones(usuarioId, area): Promise<Recomendacion[]>
    }
    class RecommendationRules {
      +reglas
    }

    RecomendacionesController ..> RecommendationEngine
    RecommendationEngine ..> RecommendationRules
```

Notas:
- El diagrama refleja relaciones clave del patrón MVC, con énfasis en el uso de modelos por controladores, mapeo de routers y aplicación de middleware.
- Para visualizar el diagrama, usa un renderer Mermaid (por ejemplo, VS Code con extensión Markdown Preview Mermaid Support) o servicios online compatibles.