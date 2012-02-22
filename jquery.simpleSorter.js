// simpleSorter plugin

(function($) {

    $.simpleSorter = function(element, options) {

		//setup some defaults
        var defaults = {

        	//ascending class name
        	ascClass:"asc",

        	//descending class name
        	descClass:"desc",

			//ignore row class
        	ignoreRowClass:"noSort",

			//ignore col class
        	ignoreColClass:"noSort",

        	//cursor to use
        	cursor:"pointer",

        	//function to trigger after sorting
        	onSort:function(){}

        }

        var plugin = this;

        plugin.settings = {}

		//wrapped DOM element
        var $element = $(element),

			//unwrapped DOM element
             element = element,

             //array to hold our rows and values for quicker sorting
             rows=[],
             //array to hold our column headers for updating
             cols=[];
             

		//this function will be executed on initialization for each element that .simpleSorter() is applied to
        plugin.init = function() {

			//setup the plugin settings, override the defaults with the options specified
            plugin.settings = $.extend({}, defaults, options);
            
            //let's loop through each of the TH elements in the first row of our table
            $element.find("tr:first th").each(function(i){
				
				//check to see if this column has the ignore class
				if($(this).hasClass(plugin.settings.ignoreColClass)){
					
					//return without attaching the event
					return;

				}
				
				//add the TH DOM element to the cols array
				cols.push(this);

				//attach the click event with the column and its index
				$(this).on("click",{colIndex:i,col:this},colClick)

					//set the cursor
					.css("cursor",plugin.settings.cursor);

            });
			//let's loop through our table rows, not including the first row and any excluded rows
            $element.find("tr:not(:first,."+plugin.settings.ignoreRowClass+")").each(function(i){
				//cache for wrapped version of 'this'
            	var $this = $(this);

				//array to hold our cell values
            	var cellVals = [];

				//loop through each row
            	$this.find("td").each(function(){

					//use a REGEX to remove any non important characters and make our cell value uppercase;
					var cellVal = $(this).text().replace(/[^A-Za-z0-9\s]/g,'').toUpperCase()

					//add our cell value to the celVals array
            		cellVals.push(cellVal);

            	});

				//put our cellVals and our TR DOM element in the rows array
            	rows.push({values:cellVals,row:this});

            });

        }

		//external function for sorting
        plugin.sort = function(col,dir) {
			
			//default sort direction is ascending
			var dir = dir||"asc";

			//call the built in sort method on our rows array
            rows.sort(function(a,b){
				
				//let's get our cel values and put them in aVal and bVal
            	var aVal = a.values[col],
            	bVal = b.values[col];

            	//if the values are equal, no sort
				if(aVal==bVal){
					return 0;
				}
				
				//if either value is not a number, assume alphabetical sort
            	if(isNaN(aVal) || isNaN(aVal)){
					if(dir == "asc"){

	            		//sort ascending
						if(aVal>bVal){
							return 1;
						} else {
							return -1;
						}

					} else {

	            		//sort descending
						if(bVal>aVal){
							return 1;
						} else {
							return -1;
						}

					}
            	} else {
            		//otherwise assume numerical sort
					if(dir == "asc"){

	            		//sort ascending
						return aVal-bVal

					} else {

	            		//sort descending
						return bVal-aVal

					}
            	}
            });
            
            //use jQuery's map to create a new array containing just our row DOM elements
            var sortedRows = $.map(rows,function(o){return o.row});
            
            //user insertAfter to insert all of the rows at once, after the header row
            $(sortedRows).insertAfter($element.find("tr:first"));

        }

		//internal function for column click event
        var colClick = function(event) {
            //get our column from the event data
            var $theCol = $(event.data.col);
            
			//check to see if the column has our ascending class
            if($theCol.hasClass(plugin.settings.ascClass)){
            
            	//remove the sorting classes from the header cells
            	$(cols).removeClass(plugin.settings.ascClass).removeClass(plugin.settings.descClass);

            	//add our descending class to the TH
            	$theCol.addClass(plugin.settings.descClass);

				//sort the column descending
	            plugin.sort(event.data.colIndex,"desc");

				//execute the onSort function from our settings
	            plugin.settings.onSort.call(this,"desc")

            } else {

            	//remove the sorting classes from the header cells
            	$(cols).removeClass(plugin.settings.ascClass).removeClass(plugin.settings.descClass);

            	//and add our ascending class to the TH
            	$theCol.addClass(plugin.settings.ascClass);

				//sort the column ascending
	            plugin.sort(event.data.colIndex,"asc");

				//execute the onSort function from our settings
	            plugin.settings.onSort.call(this,"asc")

            }
        }

		//execute our init function
        plugin.init();

    }

	//create the simpleSorter function and assign it to the jQuery object
    $.fn.simpleSorter = function(options) {
		//let's cache the arguments;
    	var args = arguments;

		//loop over the elements passed to our simpleSorter function
		//return 'this' to maintain chain-ability
        return this.each(function() {

			//check to see that the plugin has not already been initialized
            if (undefined == $(this).data('simpleSorter')) {

				//create a new instance of our simpleSorter object
                var plugin = new $.simpleSorter(this, options);

				//attach the resulting object to the data for this element
                $(this).data('simpleSorter', plugin);

            } else {
           		//get the data;
				var $data = $(this).data('simpleSorter');

            	if(typeof options == "string" && $data[options]){
            		
					//if options is a function name
            		if(typeof $data[options] == "function"){

						//execute the function and pass in the additional arguments
            			$data[options].apply(this,Array.prototype.splice.call(args,1));

            		}
            	}
            }
        });
    }

})(jQuery);