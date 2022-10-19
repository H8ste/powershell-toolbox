
import { Command } from "@tauri-apps/api/shell";


function ProcessParameterOutput(lines: string[]): ScriptParameter[] {
    const nameTitle: string = "name           :"
    const typeTitle: string = "parameterValue :"
    const requiredTitle: string = "required       :"
    const descriptionTitle: string = "description    :"
    const defaultValueTitle: string = "defaultValue   :"

    // process line by line
    let indx = 0;
    let parameters: ScriptParameter[] = [];
    let parameter: ScriptParameter | null;

    let lookingForDescription: boolean | false;
    while (indx < lines.length) {
        let currElement = lines[indx];

        if (currElement.trim() === "") {
            // case break, look for new parameter
            // (store current Parameter if any in array)
            if (parameter) {
                parameters.push(parameter)
                parameter = null;
                lookingForDescription = false;
            }
        }
        else {
            // initialise if not already initialized
            if (!parameter) {
                parameter = { name: "", type: "", required: "", description: "", defaultValue: "", };
            }

            let title = currElement.slice(0, 16);

            if (title === nameTitle) {
                lookingForDescription = false;
                parameter.name = currElement.slice(16).trim();
            }
            else if (title === typeTitle) {
                lookingForDescription = false;
                parameter.type = currElement.slice(16).trim();
            }
            else if (title === requiredTitle) {
                lookingForDescription = false;
                parameter.required = currElement.slice(16).trim();
            }
            else if (title === descriptionTitle) {
                lookingForDescription = true;

                // we do not want:  {@{Text= 
                parameter.description = currElement.slice(16 + 9).trim();
            }
            else if (title === defaultValueTitle) {
                lookingForDescription = false;
                parameter.defaultValue = currElement.slice(16).trim();
            } else {
                // not fitting any defined title - check if looking for continued description
                if (lookingForDescription) {
                    let trimmedDescription = currElement.trim()

                    // Note that we do not want:  }}        (if present remove)
                    if (trimmedDescription.slice(-2) === "}}") {
                        trimmedDescription = trimmedDescription.slice(0, trimmedDescription.length - 2);
                    }

                    // append found description
                    parameter.description = parameter.description + "\r\n" + trimmedDescription;
                } else {
                    // unknown entry found - log error
                    console.error("Line: " + indx + ". Unexpected line found: ", currElement)
                }
            }
        }

        indx++;
    }

    if (parameter) {
        parameters.push(parameter)
    }

    return parameters;
}

export async function GetPowershellParametersPriv(powershellFilePath: string): Promise<ScriptParameter[]> {
    const windows = navigator.userAgent.includes("Windows");
    let cmd = windows ? "powershell" : "sh";
    let args = windows ? ["/C"] : ["-c"];

    const commandToExecute = `Get-Help "${powershellFilePath}" -Parameter * | Select-Object Name,ParameterValue,Required,Description,DefaultValue`;

    const command = new Command(cmd, [...args, commandToExecute], {
        cwd: null,
    });

    var output = await command.execute();

    var allLines = output.stdout;

    const parameters = ProcessParameterOutput(allLines.split('\r\n'))
    return parameters;
}

export interface ScriptParameter {
    name: string;
    type: string;
    required: string;
    description: string;
    defaultValue: string;
}