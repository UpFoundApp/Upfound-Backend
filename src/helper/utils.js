export const randomID = (length = 10) => {
    return [...Array(length)].map(() => Math.floor(Math.random() * 10)).join("");
};
