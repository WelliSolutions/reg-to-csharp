//Reads the file which got selected by the input field and parses it by each line break into the commands array
function readSingleFile(evt) 
{
	var f = evt.target.files[0]; 

	if (f) 
	{
		var ff = new FileReader();
		ff.onload = function(e) 
		{ 
			var contents = e.target.result.trim();
			var lines = contents.split("\r\n\r\n");
			var output = "";
			if(checkFileFormat(lines))
			{			
				var keyUsed = false;
				for(var i = 1; i < lines.length; i++)
				{
					var line = lines[i];
					var key = line.substring(1, line.indexOf("]"));
					var base;
					switch(key.substring(0, line.indexOf("\\") - 1))
					{
						case "HKEY_CLASSES_ROOT":
							base = "ClassesRoot";
							break;
						case "HKEY_CURRENT_USER":
							base = "CurrentUser";
							break;
						case "HKEY_LOCAL_MACHINE":
							base = "LocalMachine";
							break;
						case "HKEY_USERS":
							base = "Users";
							break;
						case "HKEY_CURRENT_CONFIG":
							base = "CurrentConfig";
							break;
					}
					
					
					if(line.indexOf("]") == lines.length - 2) //no further entries
					{
						output += "Registry." + base + ".CreateSubKey(\"" + key.substring(line.indexOf("\\")).split("\\").join("\\\\") + "\");\n";
					}
					else
					{
						keyUsed = true;
						keyName = key.substring(line.indexOf("\\")).split("\\").join("\\\\");
						keyName = keyName.replace("{","{{").replace("}","}}"); // for easier string interpolation
						output += "key = Registry." + base + ".CreateSubKey($\"" + keyName + "\");\n";
						var keys = line.substring(line.indexOf("]") +1).split("\r\n");
						for(var x = 0; x < keys.length; x++)
						{
							if (keys[x].trim() == "") continue;
							var subkeys = keys[x].trim().split("=");
							if (subkeys !== undefined)
							{
								if(subkeys[0] == "@") subkeys[0] = "\"\"";
								if(subkeys[1].includes("dword:")) subkeys[1] = subkeys[1].replace("dword:", "0x") + ",RegistryValueKind.DWord";
								output += "key?.SetValue("+subkeys[0]+", " + subkeys[1] + ");\n";	
							}
						}
						
						//output += line;
					}
				}
				if(keyUsed) output = "RegistryKey key;\n" + output;
				document.getElementById("output").value = output;
			}
			else
			{
				alert("error");
			}
		}
		ff.readAsText(f);
	} 
	else 
	{ 
		alert("Failed to load file");
	}
}

function checkFileFormat(lines)
{
	var errorMessages = "";
	if(lines[0].substring(0, 36) != "Windows Registry Editor Version 5.00")
	{
		errorMessages += "Only the Windows Registry Editor Version 5.00' is supported!"
	}
	if(errorMessages == "")return true;
	return false;
	// lines = lines.reverse();
	// lines.pop();
	// lines.pop();
	// lines = lines.reverse();
}

//Every time the file in the input field got changed, the file will be parsed again
document.getElementById("fileUpload").onchange = readSingleFile;