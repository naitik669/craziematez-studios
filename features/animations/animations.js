export const fadeIn = (element) => {
  element.style.opacity = 0;
  element.style.transition = "opacity 0.5s";

  setTimeout(() => {
    element.style.opacity = 1;
  }, 50);
};

export const slideUp = (element) => {
  element.style.transform = "translateY(20px)";
  element.style.opacity = 0;

  setTimeout(() => {
    element.style.transform = "translateY(0)";
    element.style.opacity = 1;
  }, 50);
};
