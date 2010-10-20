/*
 * Monocle Tests ====================================================================
 *
 * BDD Tests are so sexy. Learn more by Googlin' JasmineBDD
 */

describe("monocle", function() {
  // Create a sandbox div
  beforeEach(function() {
    monocle = $('<div />', {
      id: 'sandbox',
      css: {
        width: '900px',
        height: '400px',
        padding: '50px'
      }
    });

    monocle.appendTo('body');
  });

  // Reset monocle so it has completely fresh state
  afterEach(function() { 
    $('body').remove(monocle);
    monocle = {};
  });

  // The plugin is essentially a router to call the appropriate
  // methods. See the official jQuery docs for info.
  describe("jquery plugin", function() {
    it("should define monocle jquery plugin", function() {
      expect($.fn.monocle).toBeDefined();
    });

    it("it should have default options", function() {
      expect($.fn.monocle.defaults).toBeDefined();
    });
    
    it("should fire the constructor by default", function() {
      spyOn(Monocle, 'init');
      monocle.monocle();
      expect(Monocle.init).toHaveBeenCalled();
    });

    it("should fire the constructor if an object is passed", function() {
      spyOn(Monocle, 'init');
      monocle.monocle({ zoom: 20 });
      expect(Monocle.init).toHaveBeenCalled();
    });

    it("should fire the proper method given a method", function() {
      spyOn(Monocle, 'destroy');
      monocle.monocle('destroy');
      expect(Monocle.destroy).toHaveBeenCalled();      
    });
    
    it("should throw an error if a bad method is passed", function() {
      try { 
        monocle.monocle('zombies');
      } catch (e) {
        expect(e).toEqual('Method zombies does not exist on jQuery.monocle');
      }
      // expect(monocle.monocle('zombies')).toThrow('Method zombies does not exist on jQuery.monocle'); 
    });
  });  
 
  // Init Method
  describe("init", function() {
    beforeEach(function() {
      monocle.monocle({ 
        CISOROOT: '/zombies',  
        CISOPTR: 420, 
        dmImageHeight: 5000, 
        dmImageWidth: 10000, 
        dmBridge: false,
        rotation: 90,
        zoom: 0.3,
        searchText: "snow",
        urlPrefix: "/",
        showThumbnail: true
      });
      data = monocle.data('monocle');
    });

    it("should attach data to the element if none exists", function() {
      expect(data).not.toBeNull();
    });

    it("should attach the options to the dom element", function() {
       expect(data.options).not.toBeNull();
    });

    it("should define the rotation", function() {
      expect(data.rotation).toEqual(90);
    });

    it("should define the base zoom", function() {
      expect(data.zoom).toEqual(0.3);
    });

    describe("Viewer Calculations", function() {
      it("should calculate & store the width of the viewer, including padding", function() {
        expect(data.viewer.width).toEqual(1000);
      });
      
      it("should calculate & store the height of the viewer, including padding", function() {
         expect(data.viewer.height).toEqual(500);
      });
    });  

    describe("CONTENTdm Image Calculations", function() {
      it("should store the width of the image", function() {
        expect(data.dmImage.width).toEqual(10000);
      });
      
      it("should store the height of the image", function() {
        expect(data.dmImage.height).toEqual(5000);
      });

      it("should store the rotated width of the image", function() {
        expect(data.dmImage.rotatedWidth).toEqual(5000);
      });
      
      it("should store the rotated height of the image", function() {
        expect(data.dmImage.rotatedHeight).toEqual(10000);
      });
    });  
    
    describe("Min Zoom Calculations", function() {
      it("should store the minimum zoom level", function() {
        expect(data.minZoom).toEqual(0.1);
      });
      
      it("should store the mimimum zoom width", function() {
        expect(data.minZoomWidth).toEqual(500); 
      });

      it("should store the minimum zoom height", function() {
        expect(data.minZoomHeight).toEqual(1000);
      });
    });  
    
    describe("Image Calculations", function() {
      it("should store image data", function() {
         expect(data.image).toBeDefined();
      });
  
      it("should define the base image width", function() {
        expect(data.image.width).toEqual(1500);        
      });
      
      it("should define the base image height", function() {
        expect(data.image.height).toEqual(3000);        
      });
    });

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
      
      /* it("should set a width", function() {
        expect(data.thumbnail.width).toEqual(60);
      }); */
    });  
  });
});  

