/*
 * Monocle Class =============================================================
 *
 * This file contains all the core methods that work for all types of monocles
 */

// Stop JavaScript Lint Warnings Messages
/*jsl:ignoreall*/
  
(function($) {

  /*
   * Private Helper Functions
   */
  
  /*
   * Monocle Methods 
   */
  
  Monocle = {
     init: function(options) {

       return this.each(function(){
         
         var $this = $(this),
             data = $this.data('monocle');
         
         // If the plugin hasn't been initialized yet
         if (!data) {
           
           $(this).data('monocle', {
               target : $this
           });
         }
       });
     },
     destroy : function( ) {

       return this.each(function(){

         var $this = $(this),
             data = $this.data('monocle');

         // Namespacing FTW
         $(window).unbind('.monocle');
         data.monocle.remove();
         $this.removeData('monocle');

       });
     
     }
  };
})(jQuery);
