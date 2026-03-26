export const openModal = (id) => {
  document.getElementById(id).classList.add("active");
};

export const closeModal = (id) => {
  document.getElementById(id).classList.remove("active");
};
