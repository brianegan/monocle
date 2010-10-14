describe("monocle", function() {
  
  // Setup and Teardown functions 
  beforeEach(function() {
    monocle = $('<div id="monocle" />');
  });

  afterEach(function() { 
    monocle = {}; 
  });

  // The plugin is essentially a router to call the appropriate
  // methods. See the official jQuery docs for info.
  describe("jquery plugin", function() {

    it("should define monocle jquery plugin", function() {
      expect($.fn.monocle).toBeDefined();
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
    });
    
  });  
 
  // Init Method
  describe("init", function() {

    beforeEach(function() {
      monocle.monocle();
    });

    it("should attach data to the element if none exists", function() {
      expect(monocle.data('monocle').target).toEqual(monocle);
    });     

  });

  

});  

