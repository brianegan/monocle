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
  describe("plugin router", function() {
    
    it("should fire the constructor if no options passed", function() {
      monocle.monocle();
      expect(monocle.monocle('init')).toHaveBeenCalled();
    });

  });  
 
  // Init Method
  describe("init", function() {

    beforeEach(function() {
      monocle.monocle();
    });

    it("should attach data to the element", function() {
      expect(monocle.data('monocle').target).toEqual(monocle);
    });     

  });

  

});  

