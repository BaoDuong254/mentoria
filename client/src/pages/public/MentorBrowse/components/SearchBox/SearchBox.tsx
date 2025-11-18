export default function SearchBox() {
  const title = "Skills";
  const listName = ["AI Engineer", "Software Engineer", "Data Scientist", "Product Manager", "UX Designer"];
  return (
    <>
      <div className='flex w-11/12 items-center justify-center rounded-xl border-2 border-gray-700 bg-gray-800 text-white'>
        <div className='my-8 flex w-11/12 flex-col gap-5'>
          <div>
            <h2 className='text-[20px] font-bold'>{title}</h2>
          </div>
          <div className='mx-2 flex flex-1 items-center rounded-lg border border-gray-700 bg-(--secondary) px-3 py-2 text-gray-300 focus-within:border-purple-500'>
            <input
              type='text'
              placeholder='Search for skills'
              className='flex-1 bg-transparent placeholder-gray-500 outline-none'
            />
          </div>
          <div className='flex flex-col gap-5'>
            {listName.map((skill) => (
              <div className='flex justify-between'>
                <div className='flex gap-2'>
                  <input type='checkbox' />
                  <span className='text-gray-300'>{skill}</span>
                </div>
                <span className='mr-2 flex items-center justify-center text-[12px] text-gray-400'>405</span>
              </div>
            ))}
          </div>
          <div>
            <span className='text-(--green)'>Show more</span>
          </div>
        </div>
      </div>
    </>
  );
}
