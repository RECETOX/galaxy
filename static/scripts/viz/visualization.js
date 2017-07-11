define(["libs/underscore","mvc/dataset/data","viz/trackster/util","utils/config","mvc/grid/grid-view","mvc/ui/ui-tabs","mvc/ui/ui-misc"],function(a,b,c,d,e,f,g){var h={toJSON:function(){var b=this,c={};return a.each(b.constructor.to_json_keys,function(a){var d=b.get(a);a in b.constructor.to_json_mappers&&(d=b.constructor.to_json_mappers[a](d,b)),c[a]=d}),c}},i=function(b,c,d,h){var i=new e({url_base:Galaxy.root+"visualization/list_history_datasets",url_data:d,dict_format:!0,embedded:!0}),j=new g.Select.View({onchange:function(){i.grid.add_filter("history",j.value()),i.update_grid()}});$.ajax({url:Galaxy.root+"api/histories",success:function(b){var c=[];a.each(b,function(a){c.push({label:a.name,value:a.id})}),j.update(c),j.trigger("change")}});var k=new e({url_base:Galaxy.root+"visualization/list_library_datasets",url_data:d,dict_format:!0,embedded:!0}),l=new f.View;l.add({id:"histories",title:"Histories",icon:"fa fa-header",$el:$("<div/>").append($("<h5/>").append("Selected history:")).append(j.$el).append($("<h5/>").append("Available datasets:")).append(i.$el)}),l.add({id:"libraries",title:"Libraries",icon:"fa fa-database",$el:$("<div/>").append(k.$el)}),Galaxy.modal.show({title:"Select datasets for new tracks",body:l.$el,closing_events:!0,buttons:{Add:function(){var a=[];l.$("input[name=id]:checked").each(function(){a[a.length]=$.ajax({url:c+"/"+$(this).val(),dataType:"json",data:{data_type:"track_config",hda_ldda:"histories"==l.current()?"hda":"ldda"}})}),$.when.apply($,a).then(function(){var a=arguments[0]instanceof Array?$.map(arguments,function(a){return a[0]}):[arguments[0]];h(a)}),Galaxy.modal.hide()},Cancel:function(){Galaxy.modal.hide()}}})},j=function(a){this.default_font=void 0!==a?a:"9px Monaco, Lucida Console, monospace",this.dummy_canvas=this.new_canvas(),this.dummy_context=this.dummy_canvas.getContext("2d"),this.dummy_context.font=this.default_font,this.char_width_px=this.dummy_context.measureText("A").width,this.patterns={},this.load_pattern("right_strand","/visualization/strand_right.png"),this.load_pattern("left_strand","/visualization/strand_left.png"),this.load_pattern("right_strand_inv","/visualization/strand_right_inv.png"),this.load_pattern("left_strand_inv","/visualization/strand_left_inv.png")};a.extend(j.prototype,{load_pattern:function(a,b){var c=this.patterns,d=this.dummy_context,e=new Image;e.src=Galaxy.root+"static/images"+b,e.onload=function(){c[a]=d.createPattern(e,"repeat")}},get_pattern:function(a){return this.patterns[a]},new_canvas:function(){var a=$("<canvas/>")[0];return a.manager=this,a}});var k=Backbone.Model.extend({defaults:{num_elements:20,obj_cache:null,key_ary:null},initialize:function(){this.clear()},get_elt:function(b){var c=this.attributes.obj_cache,d=this.attributes.key_ary,e=b.toString(),f=a.indexOf(d,function(a){return a.toString()===e});return-1!==f&&(c[e].stale?(d.splice(f,1),delete c[e]):this.move_key_to_end(b,f)),c[e]},set_elt:function(a,b){var c=this.attributes.obj_cache,d=this.attributes.key_ary,e=a.toString(),f=this.attributes.num_elements;if(!c[e]){if(d.length>=f){var g=d.shift();delete c[g.toString()]}d.push(a)}return c[e]=b,b},move_key_to_end:function(a,b){this.attributes.key_ary.splice(b,1),this.attributes.key_ary.push(a)},clear:function(){this.attributes.obj_cache={},this.attributes.key_ary=[]},size:function(){return this.attributes.key_ary.length},most_recently_added:function(){return 0===this.size()?null:this.attributes.key_ary[this.attributes.key_ary.length-1]}}),l=k.extend({defaults:a.extend({},k.prototype.defaults,{dataset:null,genome:null,init_data:null,min_region_size:200,filters_manager:null,data_type:"data",data_mode_compatible:function(){return!0},can_subset:function(){return!1}}),initialize:function(){k.prototype.initialize.call(this);var a=this.get("init_data");a&&this.add_data(a)},add_data:function(b){this.get("num_elements")<b.length&&this.set("num_elements",b.length);var c=this;a.each(b,function(a){c.set_data(a.region,a)})},data_is_ready:function(){var a=this.get("dataset"),b=$.Deferred(),d="raw_data"===this.get("data_type")?"state":"data"===this.get("data_type")?"converted_datasets_state":"error",e=new c.ServerStateDeferred({ajax_settings:{url:this.get("dataset").url(),data:{hda_ldda:a.get("hda_ldda"),data_type:d},dataType:"json"},interval:5e3,success_fn:function(a){return"pending"!==a}});return $.when(e.go()).then(function(a){b.resolve("ok"===a||"data"===a)}),b},search_features:function(a){var b=this.get("dataset"),c={query:a,hda_ldda:b.get("hda_ldda"),data_type:"features"};return $.getJSON(b.url(),c)},load_data:function(a,b,c,d){var e=this.get("dataset"),f={data_type:this.get("data_type"),chrom:a.get("chrom"),low:a.get("start"),high:a.get("end"),mode:b,resolution:c,hda_ldda:e.get("hda_ldda")};$.extend(f,d);var g=this.get("filters_manager");if(g){for(var h=[],i=g.filters,j=0;j<i.length;j++)h.push(i[j].name);f.filter_cols=JSON.stringify(h)}var k=this,l=$.getJSON(e.url(),f,function(b){b.region=a,k.set_data(a,b)});return this.set_data(a,l),l},get_data:function(a,b,d,e){var f=this.get_elt(a);if(f&&(c.is_deferred(f)||this.get("data_mode_compatible")(f,b)))return f;for(var g,h,i=this.get("key_ary"),j=this.get("obj_cache"),k=0;k<i.length;k++)if(g=i[k],g.contains(a)&&(h=!0,f=j[g.toString()],c.is_deferred(f)||this.get("data_mode_compatible")(f,b)&&this.get("can_subset")(f))){if(this.move_key_to_end(g,k),!c.is_deferred(f)){var l=this.subset_entry(f,a);this.set_data(a,l),f=l}return f}if(!h&&a.length()<this.attributes.min_region_size){a=a.copy();var m=this.most_recently_added();!m||a.get("start")>m.get("start")?a.set("end",a.get("start")+this.attributes.min_region_size):a.set("start",a.get("end")-this.attributes.min_region_size),a.set("genome",this.attributes.genome),a.trim()}return this.load_data(a,b,d,e)},set_data:function(a,b){this.set_elt(a,b)},DEEP_DATA_REQ:"deep",BROAD_DATA_REQ:"breadth",get_more_data:function(a,b,c,d,e){var f=this._mark_stale(a);if(!f||!this.get("data_mode_compatible")(f,b))return void console.log("ERROR: problem with getting more data: current data is not compatible");var g=a.get("start");e===this.DEEP_DATA_REQ?$.extend(d,{start_val:f.data.length+1}):e===this.BROAD_DATA_REQ&&(g=(f.max_high?f.max_high:f.data[f.data.length-1][2])+1);var h=a.copy().set("start",g),i=this,j=this.load_data(h,b,c,d),k=$.Deferred();return this.set_data(a,k),$.when(j).then(function(b){b.data&&(b.data=f.data.concat(b.data),b.max_low&&(b.max_low=f.max_low),b.message&&(b.message=b.message.replace(/[0-9]+/,b.data.length))),i.set_data(a,b),k.resolve(b)}),k},can_get_more_detailed_data:function(a){var b=this.get_elt(a);return"bigwig"===b.dataset_type&&b.data.length<8e3},get_more_detailed_data:function(a,b,c,d,e){var f=this._mark_stale(a);return f?(e||(e={}),"bigwig"===f.dataset_type&&(e.num_samples=1e3*d),this.load_data(a,b,c,e)):void console.log("ERROR getting more detailed data: no current data")},_mark_stale:function(a){var b=this.get_elt(a);return b||console.log("ERROR: no data to mark as stale: ",this.get("dataset"),a.toString()),b.stale=!0,b},get_genome_wide_data:function(b){var c=this,d=!0,e=a.map(b.get("chroms_info").chrom_info,function(a){var b=c.get_elt(new o({chrom:a.chrom,start:0,end:a.len}));return b||(d=!1),b});if(d)return e;var f=$.Deferred();return $.getJSON(this.get("dataset").url(),{data_type:"genome_data"},function(a){c.add_data(a.data),f.resolve(a.data)}),f},subset_entry:function(b,c){var d={bigwig:function(b,c){return a.filter(b,function(a){return a[0]>=c.get("start")&&a[0]<=c.get("end")})},refseq:function(a,c){var d=c.get("start")-b.region.get("start");return b.data.slice(d,d+c.length())}},e=b.data;return!b.region.same(c)&&b.dataset_type in d&&(e=d[b.dataset_type](b.data,c)),{region:c,data:e,dataset_type:b.dataset_type}}}),m=l.extend({initialize:function(a){var b=new Backbone.Model;b.urlRoot=a.data_url,this.set("dataset",b)},load_data:function(a,b,c,d){return a.length()<=1e5?l.prototype.load_data.call(this,a,b,c,d):{data:null,region:a}}}),n=Backbone.Model.extend({defaults:{name:null,key:null,chroms_info:null},initialize:function(a){this.id=a.dbkey},get_chroms_info:function(){return this.attributes.chroms_info.chrom_info},get_chrom_region:function(b){var c=a.find(this.get_chroms_info(),function(a){return a.chrom===b});return new o({chrom:c.chrom,end:c.len})},get_chrom_len:function(b){return a.find(this.get_chroms_info(),function(a){return a.chrom===b}).len}}),o=Backbone.Model.extend({defaults:{chrom:null,start:0,end:0,str_val:null,genome:null},same:function(a){return this.attributes.chrom===a.get("chrom")&&this.attributes.start===a.get("start")&&this.attributes.end===a.get("end")},initialize:function(a){if(a.from_str){var b=a.from_str.split(":"),c=b[0],d=b[1].split("-");this.set({chrom:c,start:parseInt(d[0],10),end:parseInt(d[1],10)})}this.attributes.str_val=this.get("chrom")+":"+this.get("start")+"-"+this.get("end"),this.on("change",function(){this.attributes.str_val=this.get("chrom")+":"+this.get("start")+"-"+this.get("end")},this)},copy:function(){return new o({chrom:this.get("chrom"),start:this.get("start"),end:this.get("end")})},length:function(){return this.get("end")-this.get("start")},toString:function(){return this.attributes.str_val},toJSON:function(){return{chrom:this.get("chrom"),start:this.get("start"),end:this.get("end")}},compute_overlap:function(a){var b,c=this.get("chrom"),d=a.get("chrom"),e=this.get("start"),f=a.get("start"),g=this.get("end"),h=a.get("end");return c&&d&&c!==d?o.overlap_results.DIF_CHROMS:b=f>e?f>g?o.overlap_results.BEFORE:h>g?o.overlap_results.OVERLAP_START:o.overlap_results.CONTAINS:e>f?e>h?o.overlap_results.AFTER:h>=g?o.overlap_results.CONTAINED_BY:o.overlap_results.OVERLAP_END:g>=h?o.overlap_results.CONTAINS:o.overlap_results.CONTAINED_BY},trim:function(){if(this.attributes.start<0&&(this.attributes.start=0),this.attributes.genome){var a=this.attributes.genome.get_chrom_len(this.attributes.chrom);this.attributes.end>a&&(this.attributes.end=a-1)}return this},contains:function(a){return this.compute_overlap(a)===o.overlap_results.CONTAINS},overlaps:function(b){return 0===a.intersection([this.compute_overlap(b)],[o.overlap_results.DIF_CHROMS,o.overlap_results.BEFORE,o.overlap_results.AFTER]).length}},{overlap_results:{DIF_CHROMS:1e3,BEFORE:1001,CONTAINS:1002,OVERLAP_START:1003,OVERLAP_END:1004,CONTAINED_BY:1005,AFTER:1006}}),p=Backbone.Collection.extend({model:o}),q=Backbone.Model.extend({defaults:{region:null,note:""},initialize:function(a){this.set("region",new o(a.region))}}),r=Backbone.Collection.extend({model:q}),s=Backbone.Model.extend(h).extend({defaults:{mode:"Auto"},initialize:function(a){this.set("dataset",new b.Dataset(a.dataset));var c=[{key:"name",default_value:this.get("dataset").get("name")},{key:"color"},{key:"min_value",label:"Min Value",type:"float",default_value:0},{key:"max_value",label:"Max Value",type:"float",default_value:1}];this.set("config",d.ConfigSettingCollection.from_models_and_saved_values(c,a.prefs));var e=this.get("preloaded_data");e=e?e.data:[],this.set("data_manager",new l({dataset:this.get("dataset"),init_data:e}))}},{to_json_keys:["track_type","dataset","prefs","mode","filters","tool_state"],to_json_mappers:{prefs:function(b,c){return 0===a.size(b)&&(b={name:c.get("config").get("name").get("value"),color:c.get("config").get("color").get("value")}),b},dataset:function(a){return{id:a.id,hda_ldda:a.get("hda_ldda")}}}}),t=Backbone.Collection.extend({model:s}),u=Backbone.Model.extend({defaults:{title:"",type:""},urlRoot:Galaxy.root+"api/visualizations",save:function(){return $.ajax({url:this.url(),type:"POST",dataType:"json",data:{vis_json:JSON.stringify(this)}})}}),v=u.extend(h).extend({defaults:a.extend({},u.prototype.defaults,{dbkey:"",drawables:null,bookmarks:null,viewport:null}),initialize:function(a){this.set("drawables",new t(a.tracks));var b=[];this.set("config",d.ConfigSettingCollection.from_models_and_saved_values(b,a.prefs)),this.unset("tracks"),this.get("drawables").each(function(a){a.unset("preloaded_data")})},add_tracks:function(a){this.get("drawables").add(a)}},{to_json_keys:["view","viewport","bookmarks"],to_json_mappers:{view:function(a,b){return{obj_type:"View",prefs:{name:b.get("title"),content_visible:!0},drawables:b.get("drawables")}}}}),w=Backbone.Router.extend({initialize:function(a){this.view=a.view,this.route(/([\w]+)$/,"change_location"),this.route(/([\w\+]+\:[\d,]+-[\d,]+)$/,"change_location");var b=this;b.view.on("navigate",function(a){b.navigate(a)})},change_location:function(a){this.view.go_to(a)}});return{BackboneTrack:s,BrowserBookmark:q,BrowserBookmarkCollection:r,Cache:k,CanvasManager:j,Genome:n,GenomeDataManager:l,GenomeRegion:o,GenomeRegionCollection:p,GenomeVisualization:v,GenomeReferenceDataManager:m,TrackBrowserRouter:w,Visualization:u,select_datasets:i}});
//# sourceMappingURL=../../maps/viz/visualization.js.map