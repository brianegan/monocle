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
        initRotation: 90,
        searchText: "snow",
        urlPrefix: "/" 
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

    describe("Viewer Calculations", function() {
      it("should calculate & store the width of the viewer, including padding", function() {
        expect(data.viewer.width).toEqual(1000);
      });
      
      it("should calculate & store the height of the viewer, including padding", function() {
         expect(data.viewer.height).toEqual(500);
      });
    });  

    describe("Image Calculations", function() {
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
    
    describe("minimum zoom properties", function() {
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
    
        
    describe("zoom Image", function() {
      it("should create a zoom image", function() {
         expect(data.zoomImage).toBeDefined();
      });
    });  
    
    

    
    
  });

});  

