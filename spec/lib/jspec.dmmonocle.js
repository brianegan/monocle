
// JSpec - dmMonocle Extensions - Copyright Brian Egan (MIT Licensed)

JSpec
.requires('jQuery', 'when using jspec.dmmonocle.js')
.include({
  name: 'dmMonocle',
  
  // --- Matchers
  
  matchers : {    
    have_width    : 'jQuery(actual).width() === expected'
    have_width    : 'jQuery(actual).height() === expected'
  }
})

