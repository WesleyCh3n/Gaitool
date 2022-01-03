import type { ReactElement } from "react"

interface PrintFileInfoProps {
  file: File;
  index: number;
}

export function PrintFileInfo(props: PrintFileInfoProps): ReactElement | null {
  // const unixDate = new Date(file.lastModified)

  return(
    <div>
      <p>{props.index}: {props.file.name}</p>
      {/* <p>Filetype: {file.type}</p>
        * <p>Size in bytes: {file.size}</p>
        * <p>lastModified: {unixDate.toDateString()}</p> */}
    </div>
  )
}
