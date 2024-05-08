/**
 * Translate passed value.
 *
 * @param {string | undefined} value
 * @returns {string | undefined} value translation
 */
export function translatePermissions(value: string | undefined) {
  switch (value) {
    case "special":
      return "* permisos especiales";
    case "order":
      return "ordenar";
    case "access":
      return "acceso";
    case "admin":
      return "administrador";
    case "as":
      return "rol";
    case "permissions":
      return "permisos";
    case "list":
      return "listar";
    case "create":
      return "crear";
    case "show":
      return "mostrar";
    case "update":
      return "actualizar";
    case "authorize":
      return "autorizar";
    case "delete":
      return "borrar";
    case "product":
      return "producto";
    case "producer":
      return "fabricante";
    case "user":
      return "usuario";
    case "category":
      return "categoría";
    case "image":
      return "imagen";
    case "type":
      return "tipo";
    case "unit":
      return "unidad";
    case "name":
      return "nombre";
    case "client":
      return "cliente";
    case "team":
      return "equipo";
    case "disable":
      return "deshabilitar";
    case "blogCategory":
      return "categoría de blog";
    case "cost":
      return "costo";
    case "package":
      return "paquete";
    case "publish":
      return "publicar";
    case "view":
      return "vista";
    case "designer":
      return "diseñador";
    default:
      return value;
  }
}
