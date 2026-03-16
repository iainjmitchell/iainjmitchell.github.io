document.addEventListener("DOMContentLoaded", function () {
  var fadeElements = document.querySelectorAll("[data-animate]");

  if (!("IntersectionObserver" in window)) {
    fadeElements.forEach(function (el) {
      el.classList.add("is-visible");
    });
    document.querySelectorAll(".timeline__item").forEach(function (el) {
      el.classList.add("is-expanded");
    });
    return;
  }

  var fadeObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
  );

  fadeElements.forEach(function (el) {
    fadeObserver.observe(el);
  });

  var timelineItems = document.querySelectorAll(".timeline__item");
  if (timelineItems.length === 0) return;

  var currentExpanded = null;
  var ticking = false;

  function updateTimeline() {
    var viewportCenter = window.innerHeight * 0.45;
    var closest = null;
    var closestDist = Infinity;

    timelineItems.forEach(function (item) {
      var rect = item.getBoundingClientRect();
      var itemCenter = rect.top + rect.height / 2;
      var dist = Math.abs(itemCenter - viewportCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = item;
      }
    });

    if (closest && closest !== currentExpanded) {
      if (currentExpanded) {
        currentExpanded.classList.remove("is-expanded");
      }
      closest.classList.add("is-expanded");
      currentExpanded = closest;
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateTimeline);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  updateTimeline();
});
