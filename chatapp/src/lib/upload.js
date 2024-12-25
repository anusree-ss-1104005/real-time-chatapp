import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const upload = async (file) => {
  const storage = getStorage();
  // const folder = file.type.startsWith("image/") ? "images" : "documents";
  // const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
  const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);

  const uploadTask = uploadBytesResumable(storageRef, file);
    return new Promise((resolve,reject)=>{
        uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log("Upload is " + progress + "% done");
              switch (snapshot.state) {
                case "paused":
                  console.log("Upload is paused");
                  break;
                case "running":
                  console.log("Upload is running");
                  break;
              }
            },
            (error) => {},
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve(downloadURL)
                //return(downloadURL)
              });
    })

 
    }
  );
};
export default upload;