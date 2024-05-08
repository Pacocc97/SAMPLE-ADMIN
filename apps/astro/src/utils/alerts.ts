import Swal from "sweetalert2";

export const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  timer: 3000,
  timerProgressBar: true,
  showConfirmButton: false,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export const ConfirmModal = Swal.mixin({
  title: "Desea seguir?",
  text: "Esta acción no se puede revertir!",
  cancelButtonColor: "#3085d6",
  confirmButtonColor: "#d33",
  showCancelButton: true,
  confirmButtonText: "Si, seguir!",
  cancelButtonText: "Cancelar",
});
