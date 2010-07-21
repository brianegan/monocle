describe 'dmMonocle'
	before_each
  	var monocle = $(fixture('monocle'))
		monocle.dmMonocle({
    	CISOROOT: '/snv',
      CISOPTR: 1493,
      dmImageHeight: 1432,
      dmImageWidth: 4012,
      thumbMaxWidth: 120,
      thumbMaxHeight: 120,
      thumbPosition: "TL",
      searchText: "",
      showNavigator: true,
      initX: 0,
      initY: 0,
      initRotation: 0,
      dmBridge: true,
      printing: true,
      urlPrefix: "http://digital.library.unlv.edu/"
		})
	end
  describe 'DmMonocle'
  	it 'should create a jQuery plugin'
      $.fn.dmMonocle.should.be_true 
		end
	end
end