import {RapidCommand} from "./command";
import {workspace, extensions, window, InputBoxOptions} from 'vscode';
import {XLog, MessageToastUtils} from "../tool";
export class CreateNewProjectCommand implements RapidCommand{
    readonly commandName = "rapidstudio.newProject";   
    public execute(...args: any[]):any{
        this.createNewProject();
    }

    private createNewProject(){
        // Get template workspace file path
        let path = require("path");
        let fs = require("fs");
        const rootPath = workspace.rootPath;
        XLog.debug(rootPath);
        let workspace_file = rootPath + path.sep + "rapid_workspace.json";
        let templateFilePath = extensions.getExtension ("realhe.rapidstudio").extensionPath +  path.sep + "template" + path.sep + "rapid_workspace.json";
        
        // Copy the template file to workspace
        fs.createReadStream(templateFilePath).pipe(fs.createWriteStream(workspace_file));
        XLog.success("Create rapid workspace successfully.");
    }
}

export class CreateNewRapidViewCommand implements RapidCommand{
    readonly commandName = "rapidstudio.newView";   
    public execute(...args: any[]):any{
        this.createNewView();
    }

    private createNewView(){
        let viewName = "view_name";
        let mainFileName = "view_main_file_name";
        let newViewOptions: InputBoxOptions = {
            prompt: "Enter the name of view you want to create",
            placeHolder: "The name of new view"
        }
    
        function inputMainFileName(argViewName){
            viewName = argViewName;
            let mainFileOptions: InputBoxOptions = {
                prompt: "Enter the mainfile name",
                placeHolder: "Main file name"
            }
            window.showInputBox(mainFileOptions).then(mainFileNameInput => {
                if (!mainFileNameInput) return;
                let parts = mainFileNameInput.split(".");
                let ext = parts[parts.length - 1];
                if(ext != "xml"){
                    window.showErrorMessage("Main file type must be xml.")
                    return;
                }
                this.addNewViewToFile(viewName,mainFileNameInput);
            });
        }
        
    
        window.showInputBox(newViewOptions).then(viewNameInput => {
            if (!viewNameInput) return;
            // Then show the main file name input dialog
            inputMainFileName(viewNameInput);
        });
        
    }


    private addNewViewToFile(view : String, mainFile : String){
        const rootPath = workspace.rootPath;
        XLog.debug(rootPath);
        let path = require("path");
        let fs = require("fs");
        function createViewMappingFile(callback){
            
        }
        // Get the name of mapping file from configuration
        let viewMappingFile = rootPath + path.sep + workspace.getConfiguration("rapidstudio").get<String>('viewMappingFile');
        fs.exists(viewMappingFile, function(isExist){
            if(!isExist){
    
                // Create and add the view mapping
                var viewMap = {
                    "view_config":[]
                };
                viewMap["view_config"].push({
                    "name" : view,
                    "mainfile" : mainFile
                });
                fs.writeFile(viewMappingFile,JSON.stringify(viewMap), function (err) {
                    if (err) {
                       throw err;
                    }
                    MessageToastUtils.showInformationMessage("Create and add rapidview successfully.");
                    XLog.success("Create and add rapidview successfully.");
                });
    
            }else{
    
                // Only add the view mapping
                fs.readFile(viewMappingFile, 'utf8', function (err, data) {
                    if (err) {
                        throw err;
                    }
    
                    // Catch json exception
                    let viewMap = {};
                    try{
                        viewMap = JSON.parse(data);
                        if(!viewMap['view_config']){
                            viewMap['view_config'] = [];
                        }
                        viewMap['view_config'].push({
                            "name" : view,
                            "mainfile" : mainFile
                        });
                    }catch(error){
                        XLog.error("The view mapping file " + viewMappingFile + " is not standard JSON format, it may have been damaged");
                        return;
                    }
    
                    // Overwrite the view mapping file
                    fs.writeFile(viewMappingFile, JSON.stringify(viewMap), function (err) {
                        if (err) {
                            throw err;
                        }
                        MessageToastUtils.showInformationMessage("Create and add rapidview successfully.");
                        XLog.success("Create rapid view successfully.");
                    });
                    
                });
            }
    
        }) ;
    }
}