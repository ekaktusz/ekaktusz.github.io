(function () {
  var selector = "#main a";

  function isEligible(link) {
    if (link.classList.contains("link-underline-skip")) {
      return false;
    }

    if (link.classList.contains("read-more")) {
      return false;
    }

    if (!link.textContent || !link.textContent.trim()) {
      return false;
    }

    if (link.querySelector("img, svg, picture, video, canvas, button, input, textarea, select, .svg-icon")) {
      return false;
    }

    var hasVisibleText = Array.prototype.slice.call(link.childNodes).some(function (node) {
      return node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0;
    });

    if (!hasVisibleText && link.children.length > 0) {
      return false;
    }

    return true;
  }

  function clearSegments(link) {
    link.querySelectorAll(":scope > .link-underline-segment").forEach(function (segment) {
      segment.remove();
    });
  }

  function collectLineRects(link) {
    var range = document.createRange();
    range.selectNodeContents(link);

    var rects = Array.prototype.slice
      .call(range.getClientRects())
      .filter(function (rect) {
        return rect.width > 0 && rect.height > 0;
      });

    range.detach();

    var lines = [];

    rects.forEach(function (rect) {
      var top = Math.round(rect.top);
      var existing = lines.find(function (line) {
        return Math.abs(line.top - top) <= 1;
      });

      if (existing) {
        existing.left = Math.min(existing.left, rect.left);
        existing.right = Math.max(existing.right, rect.right);
        existing.bottom = Math.max(existing.bottom, rect.bottom);
        return;
      }

      lines.push({
        top: top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
      });
    });

    return lines.sort(function (a, b) {
      return a.top - b.top;
    });
  }

  function enhanceLink(link) {
    clearSegments(link);
    link.classList.remove("link-underline-skip");

    if (!isEligible(link)) {
      link.classList.remove("link-underline-enhanced");
      link.classList.add("link-underline-skip");
      return;
    }

    var linkRect = link.getBoundingClientRect();
    var lines = collectLineRects(link);

    if (!lines.length) {
      link.classList.remove("link-underline-enhanced");
      return;
    }

    var totalWidth = lines.reduce(function (sum, line) {
      return sum + (line.right - line.left);
    }, 0);
    var totalDuration = 0.3;
    var elapsed = 0;

    link.classList.add("link-underline-enhanced");

    lines.forEach(function (line) {
      var width = line.right - line.left;
      var segment = document.createElement("span");
      var duration = totalWidth ? totalDuration * (width / totalWidth) : totalDuration;

      segment.className = "link-underline-segment";
      segment.setAttribute("aria-hidden", "true");
      segment.style.setProperty("--underline-left", (line.left - linkRect.left) + "px");
      segment.style.setProperty("--underline-top", (line.bottom - linkRect.top) + "px");
      segment.style.setProperty("--underline-width", width + "px");
      segment.style.setProperty("--underline-delay", elapsed + "s");
      segment.style.setProperty("--underline-duration", duration + "s");

      elapsed += duration;
      link.appendChild(segment);
    });
  }

  function enhanceAllLinks() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    document.querySelectorAll(selector).forEach(enhanceLink);
  }

  var resizeTimeout;

  window.addEventListener("load", function () {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(enhanceAllLinks);
      return;
    }

    enhanceAllLinks();
  });
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(enhanceAllLinks, 100);
  });
})();
