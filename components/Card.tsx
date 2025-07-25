
import {Models} from "node-appwrite";
import Link from "next/link";
import ThumbNail from "@/components/ThumbNail";
import {convertFileSize} from "@/lib/utils";
import FormattedDateTime from "@/components/FormattedDateTime";
import ActionDropDown from "@/components/ActionDropDown";

const Card = ({file}:{file:Models.Document}) => {
    return (
        <Link href={file.url} target="_blank" className="file-card">
            <div className="flex justify-between">

                <ThumbNail type={file.type} extension={file.extension} url ={file.url} className="!sixe-20" imageClassName="!size-11"/>
                <div className="flex flex-col items-end justify-between">
                    <ActionDropDown file={file}/>
                    <p className="body-1">{convertFileSize(file.size)}</p>
                </div>
            </div>
            <div className="file-card-details">
                <p className="subtitle-2 line-clamp-1">{file.name}</p>
                <FormattedDateTime date = {file.$createdAt } className="body-2 text-light-100"/>
                <p className="caption line-clamp-1 text-light-200">By:{file.owner.fullName}</p>
            </div>
            </Link>
    )
}
export default Card
