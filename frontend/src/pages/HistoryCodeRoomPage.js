import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { useParams } from 'react-router-dom';
import '.././index.css';
import { getHistoryDetails } from '../controllers/historyCodeRoomController';
import HistoryQuestionDisplay from '../components/HistoryQuestionDisplay';
import { editorOptions } from '../commons/constants';

function HistoryCodeRoomPage() {
  const { userId, attemptId } = useParams();

  const [code, setCode] = useState("");
  const [questionObject, setQuestionObject] = useState({
    questionTitle: "",
    questionCategory: [],
    questionComplexity: "",
    questionDescription: ""
  });
  const [language, setLanguage] = useState("javascript");

  useEffect(() => {
    const initializeRoom = async (roomId) => {
      const { 
        questionTitle, 
        questionCategory, 
        questionComplexity, 
        questionDescription, 
        attemptCode, 
        attemptLanguage 
      } = await getHistoryDetails(userId, attemptId);

      setQuestionObject({ questionTitle, questionCategory, questionComplexity, questionDescription });
      setCode(attemptCode);
      setLanguage(attemptLanguage);
    };

    initializeRoom();
  }, [attemptId, userId]);


  return (
    <div className="h-[calc(100vh-65px)] w-full flex flex-col">
      <div className="flex flex-row flex-grow h-2/3 bg-red-200">
        <div className="w-1/2 bg-[#1e1e1e] flex text-white overflow-y-auto px-3 border-r-2 border-black">
          <HistoryQuestionDisplay
            question={questionObject}
          />
        </div>

        <div className="w-1/2 h-full flex relative bg-[#1e1e1e]">
          <div className="flex flex-col w-full">
            <Editor
              className="h-full text-sm"
              language={language}
              value={code}
              onChange={(newCode) => setCode(newCode)}
              theme="vs-dark"
              options={editorOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryCodeRoomPage;
