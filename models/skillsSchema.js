import mongoose from 'mongoose';

export const skillSechema = new mongoose.Schema({
    title: String,
    proficiency: String,
     svg: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
})

export const Skills = mongoose.model("skills", skillSechema);