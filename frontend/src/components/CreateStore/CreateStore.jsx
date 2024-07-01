import './CreateStore.css';
import { useModal } from '../../context/Modal';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewStore, getStoreByCurrentUser } from '../../store/userStore.js';

const CreateStore = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const sessionUser = useSelector((state) => state.session.user);

    useEffect(() => {
        const errors = {};

        if (!name) {
            errors.name = "Please enter a name.";
        }

        if (!description) {
            errors.description = "Please enter description.";
        }

        if (!location) {
            errors.location = "Please enter a location.";
        }

        setValidationErrors(errors);
    }, [name, description, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newStoreData = {
            ownerId: sessionUser.id,
            name,
            description,
            location
        };

        const newStore = await dispatch(createNewStore(newStoreData));

        if (newStore) {
            await dispatch(getStoreByCurrentUser());
        }

        closeModal();
    };

    return (
        <div className="create-store-container">
            <h1>Hi from CreateStore</h1>

            <form onSubmit={handleSubmit} className="create-store-form">
                <input
                    name="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <textarea
                    name="description"
                    placeholder="Description"
                    rows="5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>

                <input
                    name="location"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />

                <button type="button" onClick={closeModal}>Cancel</button>
                <button type="submit" disabled={Object.values(validationErrors).length}>Create Your Store</button>

            </form>

        </div>
    );
};

export default CreateStore;
