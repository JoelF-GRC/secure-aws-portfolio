// assets/js/main.js

document.addEventListener('DOMContentLoaded', function () {
  /* -----------------------------
     Mobile Nav Menu
  ----------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var navList = document.querySelector('#nav-list');

  if (toggle && navList) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      navList.classList.toggle('nav-list--open');
    });
  }

  /* -----------------------------
     Footer Year
  ----------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* -----------------------------
     Visitor Counter (DynamoDB-backed)
  ----------------------------- */
  var visitorEl = document.getElementById('visitor-counter');

  if (visitorEl) {
    fetch('https://hvmxivh8yg.execute-api.us-west-1.amazonaws.com/counter', {
      method: 'GET'
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP error ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        var visits = data.visits || data.count || data.visitors;
        visitorEl.textContent = 'Visitors: ' + visits;
      })
      .catch(function (err) {
        console.error('Error loading visitor count:', err);
        visitorEl.textContent = 'Visitors: n/a';
      });
  }


  /* -----------------------------
     Lightbox (for gallery pages)
  ----------------------------- */
  var lightbox = document.getElementById('lightbox');
  var imgEl = document.getElementById('lightbox-image');

  if (lightbox && imgEl) {
    var triggers = document.querySelectorAll('.js-lightbox-trigger');

    function openLightbox(fullSrc, alt) {
      imgEl.src = fullSrc;
      imgEl.alt = alt || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      imgEl.src = '';
      imgEl.alt = '';
    }

    triggers.forEach(function (card) {
      card.addEventListener('click', function () {
        var img = card.querySelector('img');
        var alt = img ? img.alt : '';
        openLightbox(card.getAttribute('data-full'), alt);
      });
    });

    lightbox.addEventListener('click', function (e) {
      if (
        e.target.classList.contains('js-lightbox-close') ||
        e.target.classList.contains('lightbox-backdrop')
      ) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    });
  }
});
