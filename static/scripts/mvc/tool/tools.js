define(["libs/underscore","viz/trackster/util","mvc/dataset/data","mvc/tool/tool-form"],function(a,b,c,d){"use strict";var e={hidden:!1,show:function(){this.set("hidden",!1)},hide:function(){this.set("hidden",!0)},toggle:function(){this.set("hidden",!this.get("hidden"))},is_visible:function(){return!this.attributes.hidden}},f=Backbone.Model.extend({defaults:{name:null,label:null,type:null,value:null,html:null,num_samples:5},initialize:function(){this.attributes.html=unescape(this.attributes.html)},copy:function(){return new f(this.toJSON())},set_value:function(a){this.set("value",a||"")}}),g=Backbone.Collection.extend({model:f}),h=f.extend({}),i=f.extend({set_value:function(a){this.set("value",parseInt(a,10))},get_samples:function(){return d3.scale.linear().domain([this.get("min"),this.get("max")]).ticks(this.get("num_samples"))}}),j=i.extend({set_value:function(a){this.set("value",parseFloat(a))}}),k=f.extend({get_samples:function(){return a.map(this.get("options"),function(a){return a[0]})}});f.subModelTypes={integer:i,"float":j,data:h,select:k};var l=Backbone.Model.extend({defaults:{id:null,name:null,description:null,target:null,inputs:[],outputs:[]},urlRoot:Galaxy.root+"api/tools",initialize:function(b){this.set("inputs",new g(a.map(b.inputs,function(a){var b=f.subModelTypes[a.type]||f;return new b(a)})))},toJSON:function(){var a=Backbone.Model.prototype.toJSON.call(this);return a.inputs=this.get("inputs").map(function(a){return a.toJSON()}),a},remove_inputs:function(a){var b=this,c=b.get("inputs").filter(function(b){return-1!==a.indexOf(b.get("type"))});b.get("inputs").remove(c)},copy:function(a){var b=new l(this.toJSON());if(a){var c=new Backbone.Collection;b.get("inputs").each(function(a){a.get_samples()&&c.push(a)}),b.set("inputs",c)}return b},apply_search_results:function(b){return-1!==a.indexOf(b,this.attributes.id)?this.show():this.hide(),this.is_visible()},set_input_value:function(a,b){this.get("inputs").find(function(b){return b.get("name")===a}).set("value",b)},set_input_values:function(b){var c=this;a.each(a.keys(b),function(a){c.set_input_value(a,b[a])})},run:function(){return this._run()},rerun:function(a,b){return this._run({action:"rerun",target_dataset_id:a.id,regions:b})},get_inputs_dict:function(){var a={};return this.get("inputs").each(function(b){a[b.get("name")]=b.get("value")}),a},_run:function(d){var e=a.extend({tool_id:this.id,inputs:this.get_inputs_dict()},d),f=$.Deferred(),g=new b.ServerStateDeferred({ajax_settings:{url:this.urlRoot,data:JSON.stringify(e),dataType:"json",contentType:"application/json",type:"POST"},interval:2e3,success_fn:function(a){return"pending"!==a}});return $.when(g.go()).then(function(a){f.resolve(new c.DatasetCollection(a))}),f}});a.extend(l.prototype,e);var m=(Backbone.View.extend({}),Backbone.Collection.extend({model:l})),n=Backbone.Model.extend(e),o=Backbone.Model.extend({defaults:{elems:[],open:!1},clear_search_results:function(){a.each(this.attributes.elems,function(a){a.show()}),this.show(),this.set("open",!1)},apply_search_results:function(b){var c,d=!0;a.each(this.attributes.elems,function(a){a instanceof n?(c=a,c.hide()):a instanceof l&&a.apply_search_results(b)&&(d=!1,c&&c.show())}),d?this.hide():(this.show(),this.set("open",!0))}});a.extend(o.prototype,e);var p=Backbone.Model.extend({defaults:{search_hint_string:"search tools",min_chars_for_search:3,spinner_url:"",clear_btn_url:"",search_url:"",visible:!0,query:"",results:null,clear_key:27},urlRoot:Galaxy.root+"api/tools",initialize:function(){this.on("change:query",this.do_search)},do_search:function(){var a=this.attributes.query;if(a.length<this.attributes.min_chars_for_search)return void this.set("results",null);var b=a;this.timer&&clearTimeout(this.timer),$("#search-clear-btn").hide(),$("#search-spinner").show();var c=this;this.timer=setTimeout(function(){"undefined"!=typeof ga&&ga("send","pageview",Galaxy.root+"?q="+b),$.get(c.urlRoot,{q:b},function(a){c.set("results",a),$("#search-spinner").hide(),$("#search-clear-btn").show()},"json")},400)},clear_search:function(){this.set("query",""),this.set("results",null)}});a.extend(p.prototype,e);var q=Backbone.Model.extend({initialize:function(a){this.attributes.tool_search=a.tool_search,this.attributes.tool_search.on("change:results",this.apply_search_results,this),this.attributes.tools=a.tools,this.attributes.layout=new Backbone.Collection(this.parse(a.layout))},parse:function(b){var c=this,d=function(b){var e=b.model_class;if(e.indexOf("Tool")===e.length-4)return c.attributes.tools.get(b.id);if("ToolSection"===e){var f=a.map(b.elems,d);return b.elems=f,new o(b)}return"ToolSectionLabel"===e?new n(b):void 0};return a.map(b,d)},clear_search_results:function(){this.get("layout").each(function(a){a instanceof o?a.clear_search_results():a.show()})},apply_search_results:function(){var a=this.get("tool_search").get("results");if(null===a)return void this.clear_search_results();var b=null;this.get("layout").each(function(c){c instanceof n?(b=c,b.hide()):c instanceof l?c.apply_search_results(a)&&b&&b.show():(b=null,c.apply_search_results(a))})}}),r=Backbone.View.extend({initialize:function(){this.model.on("change:hidden",this.update_visible,this),this.update_visible()},update_visible:function(){this.model.attributes.hidden?this.$el.hide():this.$el.show()}}),s=r.extend({tagName:"div",render:function(){var a=$("<div/>");if(a.append(y.tool_link(this.model.toJSON())),"upload1"===this.model.id)a.find("a").on("click",function(a){a.preventDefault(),Galaxy.upload.show()});else if("Tool"===this.model.get("model_class")){var b=this;a.find("a").on("click",function(a){a.preventDefault();var c=new d.View({id:b.model.id,version:b.model.get("version")});c.deferred.execute(function(){Galaxy.app.display(c)})})}return this.$el.append(a),this}}),t=r.extend({tagName:"div",className:"toolPanelLabel",render:function(){return this.$el.append($("<span/>").text(this.model.attributes.text)),this}}),u=r.extend({tagName:"div",className:"toolSectionWrapper",initialize:function(){r.prototype.initialize.call(this),this.model.on("change:open",this.update_open,this)},render:function(){this.$el.append(y.panel_section(this.model.toJSON()));var b=this.$el.find(".toolSectionBody");return a.each(this.model.attributes.elems,function(a){if(a instanceof l){var c=new s({model:a,className:"toolTitle"});c.render(),b.append(c.$el)}else if(a instanceof n){var d=new t({model:a});d.render(),b.append(d.$el)}}),this},events:{"click .toolSectionTitle > a":"toggle"},toggle:function(){this.model.set("open",!this.model.attributes.open)},update_open:function(){this.model.attributes.open?this.$el.children(".toolSectionBody").slideDown("fast"):this.$el.children(".toolSectionBody").slideUp("fast")}}),v=Backbone.View.extend({tagName:"div",id:"tool-search",className:"bar",events:{click:"focus_and_select","keyup :input":"query_changed","click #search-clear-btn":"clear"},render:function(){return this.$el.append(y.tool_search(this.model.toJSON())),this.model.is_visible()||this.$el.hide(),this.$el.find("[title]").tooltip(),this},focus_and_select:function(){this.$el.find(":input").focus().select()},clear:function(){return this.model.clear_search(),this.$el.find(":input").val(""),this.focus_and_select(),!1},query_changed:function(a){return this.model.attributes.clear_key&&this.model.attributes.clear_key===a.which?(this.clear(),!1):void this.model.set("query",this.$el.find(":input").val())}}),w=Backbone.View.extend({tagName:"div",className:"toolMenu",initialize:function(){this.model.get("tool_search").on("change:results",this.handle_search_results,this)},render:function(){var a=this,b=new v({model:this.model.get("tool_search")});return b.render(),a.$el.append(b.$el),this.model.get("layout").each(function(b){if(b instanceof o){var c=new u({model:b});c.render(),a.$el.append(c.$el)}else if(b instanceof l){var d=new s({model:b,className:"toolTitleNoSection"});d.render(),a.$el.append(d.$el)}else if(b instanceof n){var e=new t({model:b});e.render(),a.$el.append(e.$el)}}),a.$el.find("a.tool-link").click(function(b){var c=$(this).attr("class").split(/\s+/)[0],d=a.model.get("tools").get(c);a.trigger("tool_link_click",b,d)}),this},handle_search_results:function(){var a=this.model.get("tool_search").get("results");a&&0===a.length?$("#search-no-results").show():$("#search-no-results").hide()}}),x=Backbone.View.extend({className:"toolForm",render:function(){this.$el.children().remove(),this.$el.append(y.tool_form(this.model.toJSON()))}}),y=(Backbone.View.extend({className:"toolMenuAndView",initialize:function(){this.tool_panel_view=new w({collection:this.collection}),this.tool_form_view=new x},render:function(){this.tool_panel_view.render(),this.tool_panel_view.$el.css("float","left"),this.$el.append(this.tool_panel_view.$el),this.tool_form_view.$el.hide(),this.$el.append(this.tool_form_view.$el);var a=this;this.tool_panel_view.on("tool_link_click",function(b,c){b.preventDefault(),a.show_tool(c)})},show_tool:function(a){var b=this;a.fetch().done(function(){b.tool_form_view.model=a,b.tool_form_view.render(),b.tool_form_view.$el.show(),$("#left").width("650px")})}}),{tool_search:a.template(['<input id="tool-search-query" class="search-query parent-width" name="query" ','placeholder="<%- search_hint_string %>" autocomplete="off" type="text" />','<a id="search-clear-btn" title="clear search (esc)"> </a>','<img src="<%= spinner_url %>" id="search-spinner" class="search-spinner" />'].join("")),panel_section:a.template(['<div class="toolSectionTitle" id="title_<%- id %>">','<a href="javascript:void(0)"><span><%- name %></span></a>',"</div>",'<div id="<%- id %>" class="toolSectionBody" style="display: none;">','<div class="toolSectionBg"></div>',"<div>"].join("")),tool_link:a.template(['<span class="labels">',"<% _.each( labels, function( label ){ %>",'<span class="label label-default label-<%- label %>">',"<%- label %>","</span>","<% }); %>","</span>",'<a class="<%- id %> tool-link" href="<%= link %>" target="<%- target %>" minsizehint="<%- min_width %>">',"<%- name %>","</a>"," <%- description %>"].join("")),tool_form:a.template(['<div class="toolFormTitle"><%- tool.name %> (version <%- tool.version %>)</div>','<div class="toolFormBody">',"<% _.each( tool.inputs, function( input ){ %>",'<div class="form-row">','<label for="<%- input.name %>"><%- input.label %>:</label>','<div class="form-row-input">',"<%= input.html %>","</div>",'<div class="toolParamHelp" style="clear: both;">',"<%- input.help %>","</div>",'<div style="clear: both;"></div>',"</div>","<% }); %>","</div>",'<div class="form-row form-actions">','<input type="submit" class="btn btn-primary" name="runtool_btn" value="Execute" />',"</div>",'<div class="toolHelp">','<div class="toolHelpBody"><% tool.help %></div>',"</div>"].join(""),{variable:"tool"})});return{ToolParameter:f,IntegerToolParameter:i,SelectToolParameter:k,Tool:l,ToolCollection:m,ToolSearch:p,ToolPanel:q,ToolPanelView:w,ToolFormView:x}});
//# sourceMappingURL=../../../maps/mvc/tool/tools.js.map