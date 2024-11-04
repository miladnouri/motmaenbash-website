$(document).ready(function(e) {
  $("header ul li a,header a.btn").click(function(e) {
    const section = $(this).attr("href");

    if (section.startsWith('#')) {
      e.preventDefault();  // Only prevent default action for internal links
      $("html").animate({ scrollTop: $(section).offset().top }, 500);
    }
    
  });

});
