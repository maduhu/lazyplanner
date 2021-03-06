/*
 Copyright (C) Bilgin Ibryam http://www.ofbizian.com

 This is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 2.1 of the License, or
 (at your option) any later version.

 Foobar is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with this software.  If not, see http://www.fsf.org
 */
Ext.define('TodoBrowser.UserForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.userForm',
    id : 'userForm',
    width: 600,
    padding : 10,
    frame:true,
    border : false,
//    fieldDefaults: {
//        labelAlign: 'left',
//        msgTarget: 'side'
//    },

    initComponent: function(){
    	this.createStore();
        Ext.apply(this, {
		    items: [{
		        xtype: 'gridpanel',
		        store: this.store,
		        height: 200,
		        title:'Assigned to Projects',
		        columns: [{
		                id     : 'project',
		                text   : 'Project',
		                flex   : 1,
		                sortable : true,
		                dataIndex: 'workEffortName'
		            }, {
		                text   : 'Since',
		                width    : 150,
		                sortable : true,
		                dataIndex: 'fromDate',
		                renderer: this.formatCreationDate
		            }, {
		                html : 'Unassign',
		            	xtype  : 'actioncolumn',
		                width    : 50,
		                items: [{
		                    icon   : '../../app/images/dialog-no.png',
		                    tooltip: 'Remove current user from project',
		                    scope: this,
		                    handler: function(grid, rowIndex, colIndex) {
		                        var rec = this.store.getAt(rowIndex);
		                        var projectName = rec.get('workEffortName');
		                        Ext.Msg.show({
		                            title:'Unassign User?',
		                            msg: 'Do you want to remove the current user from project: ' + projectName + '?',
		                            buttons: Ext.Msg.YESNOCANCEL,
		                            icon: Ext.Msg.QUESTION,
		                            fn : function(buttonId) {
		                            	if ('yes' === buttonId) {
		  		                          Ext.Ajax.request({
		  								    url: deleteUserAssigment,
		  								    params: {
		  								    	workEffortId: rec.get('workEffortId'),
		  								    	partyId: rec.get('partyId'),
		  								    	fromDate: rec.get('fromDate').getTime(),
		  								    },
		  								    scope : this,
		  								    success: function(response, opts) {
		  								        this.store.remove(rec);
		  				          		    	showMessage("User removed from the project");          		    	
		  								    }, 
		  								    failure: function(response, opts) {
		  								    	showError('Error removing user from project');          		    	
											}
		  								});
		                            	}
		                            },
		                            scope: this
		                       });
		                    }
		                }]
		            }
		            
		            /*, {
		                text   : 'Star Date',
		                flex: 1,
		                sortable : true,
		                dataIndex: 'fromDate'
		            }, {
		                text   : 'End Date',
		                flex: 1,
		                sortable : true,
		                renderer : this.thruDateRenderer,
		                dataIndex: 'thruDate'
		            } */],
		        listeners: {
		            selectionchange: function(model, records) {
		                if (records[0]) {
		                    //this.up('form').getForm().loadRecord(records[0]);
		                }
		            }
		        }
		    }, {
		        //margin: '0 0 0 10',
		        xtype: 'fieldset',
		        title:'New Project Assigment',
		        defaults: {
		            //width: 240,
		            labelWidth: 40
		        },
		        items: [{
	                store: workspaceProjectStore,
	                allowBlank : false,
					fieldLabel: 'Project',
	                //anchor:'96%',
					valueField:'id',
					displayField:'name',
			        name: 'workEffortId',
	                xtype:'combo',
	                queryMode: 'local',
			        typeAhead: false,					   
	 				editable : true,
	 				forceSelection : true,
	 				triggerAction : 'all'
	            }/*, {
	                store: roleStore,
	                allowBlank : false,
					fieldLabel: 'Role',
	                anchor:'96%',
					valueField:'id',
					displayField:'name',
			        name: 'roleTypeId',
	                xtype:'combo',
	                queryMode: 'local',
			        typeAhead: false,					   
	 				editable : true,
	 				forceSelection : true,
	 				triggerAction : 'all'
	            } , {
	                xtype: 'datefield',
	                format : 'Y-m-d',
	                fieldLabel: 'Start Date',
	                allowBlank: false,
	                name: 'fromDate'
	            }, {
	                xtype: 'datefield',
	                format : 'Y-m-d',
	                fieldLabel: 'End Date',
	                name: 'thruDate'
	            } */]
		    }],
		
        buttons: [{
            text: 'Save',
            formBind: true,
            scope: this,
            handler: function() {
            	Ext.getCmp('userForm').getForm().submit({
            		clientValidation: true,
            		url: createUserAssigment,
            	    params:{partyId : this.partyId},
          		    success: function(form, action){
          		    	form.reset();
          		    	Ext.getCmp('userForm').onUserAssigmentCreate();
          		    	showMessage("User assigned to the project");          		    	
        		    },
        		    failure: function(form, action){
        		    	extractAndShowError(action);
        		    }
        		});
            }
        }, {
            text: 'Cancel',
        	handler: function(){
        		Ext.getCmp('userForm').getForm().reset();
      	   }
        }],
      });
	    this.callParent(arguments);
      },
    
	  loadUser: function(partyId) {
		  this.partyId = partyId;
	      this.store.getProxy().extraParams.partyId = partyId;
	      this.store.load();
	  },
 
      onUserAssigmentCreate: function(){
    	  this.store.load();
      },
    
	  thruDateRenderer: function(val) {
	    if (val){
	        return val;
	    } 
	    return '<span style="color:red;">Not set</span>';
	  },
	  
    formatCreationDate: function(value, p, record){
        return Ext.Date.format(value, displayDateForm);
    },

    createStore : function() {
    	this.store = Ext.create('Ext.data.Store', {
            model: 'TodoBrowser.UserAssigmentGrid',
	        id : 'assigmentStore',
            //autoLoad: false,
            //autoLoad: {start: 0, limit: 25},
            pageSize : 10,
            listeners: {
                load: this.onLoad,
                scope: this
            }
        });
    	return this.store;
	},
	
    onLoad: function(){ 
        //this.getSelectionModel().select(0);
    }
    
});



