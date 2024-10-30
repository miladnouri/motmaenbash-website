$(document).ready(function(e) {
  $("header ul li a,header a.btn-bg").click(function(e) {
    const section = $(this).attr("href");

    if (section.startsWith('#')) {
      e.preventDefault();  // Only prevent default action for internal links
      $("html").animate({ scrollTop: $(section).offset().top }, 500);
    }
    
  });

  $(window).scroll(function(e) {
    if ($(window).scrollTop() >= $("header").outerHeight() / 2) {
      if (
        $(window).scrollTop() + $(window).height() >=
        $(document).height() - 150
      ) {
        $("#hover-btn").fadeOut(100);
      } else {
        $("#hover-btn").fadeIn(100);
      }
    } else {
      $("#hover-btn").fadeOut(100);
    }
  });
});
