export default {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!el.contains(event.target) && el !== event.target) {
        binding.value(event, el);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  }
}