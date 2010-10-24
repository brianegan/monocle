/*
 * Monocle Tests ==============================================================
 *
 * TDD is so sexy. Learn more by Googlin' QUnit and TDD/BDD
 */

var el;

(function($) {

	/* Helper Functions */
	function opts(option) {
		return el.monocle('option', option);
	}

	module("monocle : constructor");

	test("_create", function() {
		
		el = $("#monocle").css({
			width: '900px',
			height: '400px',
			padding: '50px'
		})
		.monocle({ 
      CISOROOT: '/zombies',  
      CISOPTR: 420, 
      sourceImageHeight: 5000, 
      sourceImageWidth: 10000, 
      dmBridge: false,
      rotation: 90,
      zoom: 0.3,
      searchText: "snow",
      showThumbnail: true
		});

		// Basic State
		equals(opts('rotation'), 90, "It should attach the rotation to the data");
		equals(opts('zoom'), 0.3, "It should attach the zoom to the data");

		// Viewer Calculations
		equals(opts('viewerWidth'), 1000, "It should calculate and cache the viewer innerWidth()");
		equals(opts('viewerHeight'), 500, "It should calculate and cache the viwer innerHeight()");

		// Current Rotated sourceImage Dimensions
		equals(opts('currentSourceImageWidth'), 5000, "It should calculate and cache the current image width (ex: rotated)");
		equals(opts('currentSourceImageHeight'), 10000, "It should calculate and cache the current image height (ex: rotated)");
				
		equals(opts('minZoom'), 0.05, "It should calc and store the minimum zoom level");
		equals(opts('minImageWidth'), 250, "It should store the mimimum zoom width");
		equals(opts('minImageHeight'), 500, "It should store the mimimum zoom height");
		
		// Current Image Width
		equals(opts('currentImageWidth'), 1500, "It should set the base image width");
		equals(opts('currentImageHeight'), 3000, "It should set the base image height");

		// Base Image
		
		// Attach the Base Image to the page
		ok(el.children('.ui-monocle-baseImage').length > 0, "It should append a base image to the page");
		
			
	});

})(jQuery);

/*
  // The plugin is essentially a router to call the appropriate
  // methods. See the official jQuery docs for info.
  describe("jquery plugin", function() {

  // Init Method
  describe("init", function() {

    describe("Thumbnail Calculations", function() {
      it("should store thumbnail data", function() {
        expect(data.thumbnail).toBeDefined();
      });

      it("should set a visibility", function() {
        expect(data.thumbnail.visible).toBeTruthy();
      });

      it("should define the ratio between thumb dimensions and dmImage dimensions", function() {
        expect(data.thumbnail.ratio).toEqual(0.012);
      });
      
      it("should set a width", function() {
        expect(data.thumbnail.width).toEqual(60);
      }); 
    });  
  });
});  
 */
