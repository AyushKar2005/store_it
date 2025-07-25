"use client"
import React, { useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import {Button} from "@/components/ui/button";
import {cn, convertFileToUrl,getFileType} from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner"
import ThumbNail from "@/components/ThumbNail";
import {MAX_FILE_SIZE} from "@/constants";
import {uploadFile} from "@/lib/actions/file.actions";
import {usePathname} from "next/navigation";

interface Props {
    ownerId: string;
    accountId: string;
    className?: string;
}

const FileUploader = ({ownerId,accountId,className}:Props) => {

    const path = usePathname()
    const[files,setfiles] = useState<File[]>([])
    const onDrop = useCallback(async(acceptedFiles : File[]) => {
        setfiles(acceptedFiles);

        const uploadPromises = acceptedFiles.map(async(file)=>{
            if(file.size>MAX_FILE_SIZE){
                setfiles((prevFiles)=>prevFiles.filter((f)=>f.name !== file.name));

                return toast(
                    <p className="body-2 text-white">
                        <span className="font-semibold">{file.name}</span> is too large. Max file size is 50MB.
                    </p>,
                    {
                        style: { backgroundColor: "#ef4444", color: "#fff" }, // optional: destructive styling
                    }
                )
            }
            return uploadFile({file,ownerId,accountId,path}).then(
                (uploadedFile)=>{
                    if(uploadedFile){
                        setfiles((prevFiles)=>prevFiles.filter((f)=>f.name !== file.name)
                        )
                    }
                }
            )
        })
        await Promise.all(uploadPromises)

    }, [ownerId,accountId,path])
    const {getRootProps, getInputProps} = useDropzone({onDrop})

    const handleRemoveFile = (e:React.MouseEvent<HTMLImageElement , MouseEvent>,fileName:string)=>{
        e.stopPropagation()
        setfiles((prevFiles)=>prevFiles.filter((file)=>file.name!== fileName))
    }
    return (
        <div {...getRootProps()} className="cursor-pointer">
            <input {...getInputProps()} />
            <Button type="button" className={cn("uploader-button",className)}>
                <Image src="/assets/icons/upload.svg" alt="upload" width={24} height={24} />{" "}
                <p>Upload</p>

            </Button>
            {files.length > 0 &&(
                <ul className="uploader-preview-list">
                    <h4 className="h4 text-light-100">Uploading</h4>

                    {files.map((file,index)=>{
                        const {type,extension} = getFileType(file.name);

                        return (
                            <li key={`${file.name}-${index}`} className="uploader-preview-item">
                    <div className="flex-items-center gap-3">
                        <ThumbNail
                        type = {type}
                        extension = {extension}
                        url ={convertFileToUrl(file)}/>
                        <div className="preview-item-name">
                            {file.name}
                            <Image src="/assets/icons/file-loader.gif" width={80} height={26} alt="loader"/>
                        </div>
                    </div>
                                <Image src="/assets/icons/remove.svg" width={24} height={24} alt="Remove" onClick={(e)=>handleRemoveFile(e,file.name)}/>
                </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

export default FileUploader
