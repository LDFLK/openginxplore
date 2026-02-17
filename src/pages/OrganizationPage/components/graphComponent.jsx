import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Box, Alert, AlertTitle } from "@mui/material";
import ForceGraph3D from "react-force-graph-3d";
import api from "../../../services/services";
import utils from "../../../utils/utils";
import { useSelector } from "react-redux";

import Drawer from "./graphDrawer";
import SpriteText from "three-spritetext";
import WebGLChecker, { isWebGLAvailable } from "../../../components/webgl_checker";
import LoadingComponent from "../../../components/loading_component";
import { useThemeContext } from "../../../context/themeContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function GraphComponent({ activeMinistries, filterType }) {
  const [loading, setLoading] = useState(true);
  const [webgl, setWebgl] = useState(true);
  const [expandDrawer, setExpandDrawer] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphWidth, setGraphWidth] = useState(window.innerWidth);
  const [graphHeight, setGraphHeight] = useState(window.innerHeight);
  const [allNodes, setAllNodes] = useState([]);
  const [relations, setRelations] = useState([]);
  const [ministryDictionary, setMinistryDictionary] = useState({});
  const [departmentDictionary, setDepartmentDictionary] = useState({});
  const [personDictionary, setPersonDictionary] = useState({});
  const [ministerToDepartments, setMinisterToDepartment] = useState({});
  const [graphParent, setGraphParent] = useState(null);
  const [nodeLoading, setNodeLoading] = useState(false);
  const [isDateTaken, setIsDateTake] = useState(false);

  const { colors, isDark } = useThemeContext();

  // Calculate graph width based on drawer state
  useEffect(() => {
    const calculateGraphWidth = () => {
      const screenWidth = window.innerWidth;

      if (expandDrawer) {
        // Mobile: full width (drawer overlays)
        if (screenWidth < 768) {
          setGraphWidth(screenWidth);
        }
        // Tablet: 50% for drawer
        else if (screenWidth < 1024) {
          setGraphWidth(Math.floor(screenWidth / 2));
        }
        // Desktop: 2/3 for graph, 1/3 for drawer
        else {
          setGraphWidth(Math.floor((screenWidth * 2) / 3));
        }
      } else {
        setGraphWidth(screenWidth);
      }
    };

    calculateGraphWidth();

    const handleResize = () => {
      calculateGraphWidth();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [expandDrawer]);

  // Track graph height responsively (numeric, avoids remount/reset)
  useEffect(() => {
    const calculateGraphHeight = () => {
      setGraphHeight(window.innerHeight);
    };

    calculateGraphHeight();
    window.addEventListener("resize", calculateGraphHeight);
    return () => window.removeEventListener("resize", calculateGraphHeight);
  }, []);

  const focusRef = useRef();
  const cameraAnimTimeoutRef = useRef();
  const navigate = useNavigate();

  const presidents = useSelector((state) => state.presidency.presidentList);
  const selectedDate = useSelector((state) => state.presidency.selectedDate);
  const selectedPresident = useSelector(
    (state) => state.presidency.selectedPresident
  );
  const gazetteDataClassic = useSelector((state) => state.gazettes.gazetteData);
  const allMinistryData = useSelector(
    (state) => state.allMinistryData.allMinistryData
  );
  const allDepartmentData = useSelector(
    (state) => state.allDepartmentData.allDepartmentData
  );
  const allPersonData = useSelector((state) => state.allPerson.allPerson);

  useEffect(() => {
    const checkWebGL = () => {
      const webglAvailable = isWebGLAvailable();
      setWebgl(webglAvailable);

      if (!webglAvailable) {
        console.warn("WebGL not available. This may be due to:");
        console.warn("1. Hardware acceleration disabled in browser");
        console.warn("2. Outdated graphics drivers");
        console.warn("3. Browser security settings");
        console.warn("4. Corporate firewall blocking WebGL");
        console.warn("5. WebGL context lost or not ready yet");
      }
    };

    // Check immediately
    checkWebGL();

    // Check again after a short delay (in case of timing issues)
    const timeoutId = setTimeout(checkWebGL, 1000);

    // Check again when page becomes visible (handles tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(checkWebGL, 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Build graph function
  const buildGraph = async (parentNode = null) => {
    setGraphParent(parentNode);
    try {
      if (!parentNode) {
        setLoading(true);

        const govNode = {
          id: "gov_01",
          name: "Government",
          group: 1,
          color: "#00ff00",
          type: "government",
        };

        const ministryDic = {};
        const ministryToGovLinks = [];
        const personDic = {};
        const personLinks = [];

        activeMinistries.forEach((ministry) => {

          // Ministry node
          ministryDic[ministry.id] = {
            id: ministry.id,
            name: ministry.name,
            created: ministry.startTime,
            group: 2,
            color: ministry.type == "stateMinister" ? "#e77f18ff" : "#D3AF37",
            type: ministry.type,
          };

          // Link to government
          ministryToGovLinks.push({
            source: "gov_01",
            target: ministry.id,
            value: 1,
            type: "level1",
          });

          // To show person in level 3
          let showPerson = false;
          let personId = null;
          let personName = null;

          if (
            filterType === "newPerson" &&
            ministry.newPerson &&
            ministry.headMinisterId
          ) {
            showPerson = true;
            personId = ministry.headMinisterId;
            personName = utils.extractNameFromProtobuf(
              ministry.headMinisterName
            );
          } else if (filterType === "presidentAsMinister") {
            const headName = ministry.headMinisterName
              ? utils
                .extractNameFromProtobuf(ministry.headMinisterName)
                .split(":")[0]
                .toLowerCase()
                .trim()
              : null;
            const presidentName = selectedPresident
              ? utils
                .extractNameFromProtobuf(selectedPresident.name)
                .split(":")[0]
                .toLowerCase()
                .trim()
              : null;

            if (
              (!ministry.headMinisterId && selectedPresident) ||
              (headName && presidentName && headName === presidentName)
            ) {
              showPerson = true;
              personId = selectedPresident.id;
              personName = utils.extractNameFromProtobuf(
                selectedPresident.name
              );
            }
          }

          if (showPerson && personId) {
            personDic[personId] = {
              id: personId,
              name: personName,
              group: 3,
              color: "#4287f5",
              type: "person",
            };

            personLinks.push({
              source: ministry.id,
              target: personId,
              value: 2,
              type: "level3",
            });
          }
        });

        if (focusRef.current) {
          focusRef.current.stopAnimation?.();
        }

        setMinistryDictionary(ministryDic);
        setPersonDictionary(personDic);
        setDepartmentDictionary({});
        setMinisterToDepartment({});

        setAllNodes([
          govNode,
          ...Object.values(ministryDic),
          ...Object.values(personDic),
        ]);
        setRelations([...ministryToGovLinks, ...personLinks]);
      } else if (parentNode.type === "cabinetMinister" || parentNode.type === "stateMinister") {
        const response = await api.fetchAllRelationsForMinistry({
          ministryId: parentNode.id,
          name: "AS_DEPARTMENT",
          activeAt: selectedDate.date,
        });
        const responsePerson = await api.fetchAllRelationsForMinistry({
          ministryId: parentNode.id,
          name: "AS_APPOINTED",
          activeAt: selectedDate.date,
        });

        const departmentLinks = response.map((department) => ({
          source: parentNode.id,
          target: department.relatedEntityId,
          value: 2,
          type: "level2",
        }));

        const personLinks = responsePerson.map((person) => ({
          source: parentNode.id,
          target: person.relatedEntityId,
          value: 3,
          type: "level3",
        }));

        const departmentDic = departmentLinks
          .map((rel) => allDepartmentData[rel.target])
          .filter(Boolean)
          .reduce((acc, department) => {
            acc[department.id] = {
              id: department.id,
              name: utils.extractNameFromProtobuf(department.name),
              created: department.created,
              kind: department.kind,
              terminated: department.terminated,
              group: 3,
              type: "department",
            };
            return acc;
          }, {});

        const personDic = personLinks
          .map((rel) => allPersonData[rel.target])
          .filter(Boolean)
          .reduce((acc, person) => {
            acc[person.id] = {
              id: person.id,
              name: utils.extractNameFromProtobuf(person.name),
              created: person.created,
              kind: person.kind,
              terminated: person.terminated,
              group: 4,
              type: "person",
            };
            return acc;
          }, {});

        // FALLBACK: If no AS_APPOINTED person found, add the presid
        if (personLinks.length === 0 && selectedPresident) {
          personDic[selectedPresident.id] = {
            id: selectedPresident.id,
            name: utils.extractNameFromProtobuf(selectedPresident.name),
            created: selectedPresident.created,
            kind: selectedPresident.kind,
            terminated: selectedPresident.terminated,
            group: 4,
            type: "person",
          };

          personLinks.push({
            source: parentNode.id,
            target: selectedPresident.id,
            value: 3,
            type: "level3",
          });
        }

        const ministerToDepartments = {};
        departmentLinks.forEach((rel) => {
          if (!ministerToDepartments[rel.source]) {
            ministerToDepartments[rel.source] = [];
          }
          ministerToDepartments[rel.source].push(rel);
        });

        const ministerToPerson = {};
        personLinks.forEach((rel) => {
          if (!ministerToPerson[rel.source]) {
            ministerToPerson[rel.source] = [];
          }
          ministerToPerson[rel.source].push(rel);
        });

        if (focusRef.current) {
          focusRef.current.stopAnimation?.();
        }

        setDepartmentDictionary(departmentDic);
        setPersonDictionary(personDic);
        setMinisterToDepartment(ministerToDepartments);

        setAllNodes([
          parentNode,
          ...Object.values(departmentDic),
          ...Object.values(personDic),
        ]);
        setRelations([...departmentLinks, ...personLinks]);
      }
    } catch (e) {
      console.error("Error building graph:", e.message);
    } finally {
      setLoading(false);
      // clear any node-specific loading state when graph build completes
      setNodeLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedMinistry = params.get("ministry");

    if (selectedMinistry) {
      console.log("Selected ministry:", allMinistryData[selectedMinistry]);
      const ministryParent = {
        id: allMinistryData[selectedMinistry].id,
        name: utils.extractNameFromProtobuf(
          allMinistryData[selectedMinistry].name
        ),
        created: allMinistryData[selectedMinistry].startTime,
        group: 2,
        color: "#D3AF37",
        type: allMinistryData[selectedMinistry].kind.minor,
      };
      buildGraph(ministryParent);
    } else if (selectedDate && selectedPresident) {
      buildGraph();
    }
  }, [
    selectedDate,
    selectedPresident,
    activeMinistries,
    filterType,
    location.search,
  ]);

  // Handle WebGL context loss and restoration
  useEffect(() => {
    const canvas = focusRef.current?.renderer()?.domElement;

    if (canvas) {
      const handleContextLost = (event) => {
        console.warn(
          "WebGL context lost - this is normal and can happen due to:"
        );
        console.warn("- GPU memory pressure");
        console.warn("- Browser tab switching");
        console.warn("- System resource constraints");
        event.preventDefault();
        setWebgl(false);
      };

      const handleContextRestored = () => {
        // Re-check WebGL availability
        const webglAvailable = isWebGLAvailable();
        setWebgl(webglAvailable);

        if (webglAvailable) {
          console.log("WebGL is now available again");
        } else {
          console.warn("WebGL context restored but still not available");
        }
      };

      canvas.addEventListener("webglcontextlost", handleContextLost);
      canvas.addEventListener("webglcontextrestored", handleContextRestored);

      return () => {
        if (canvas) {
          canvas.removeEventListener("webglcontextlost", handleContextLost);
          canvas.removeEventListener(
            "webglcontextrestored",
            handleContextRestored
          );
        }
      };
    }
  }, [focusRef.current]);

  // Memoized graph data
  const graphData = useMemo(() => {
    if (loading || allNodes.length === 0 || relations.length === 0) {
      return { nodes: [], links: [] };
    }

    const validNodes = allNodes.filter(
      (node) =>
        node &&
        typeof node.id !== "undefined" &&
        typeof node.name !== "undefined"
    );

    const validLinks = relations.filter(
      (link) =>
        link &&
        typeof link.source !== "undefined" &&
        typeof link.target !== "undefined"
    );

    return {
      nodes: validNodes,
      links: validLinks,
    };
  }, [allNodes, relations, loading]);

  const getNodeObject = useCallback(
    (node) => {
      const sprite = new SpriteText(utils.makeMultilineText(node.name));
      sprite.textHeight = 10;
      sprite.fontWeight = 400;
      sprite.fontFace = "poppins";
      sprite.center.y = -0.5;
      sprite.color = colors.textPrimary;
      sprite.padding = 4;
      sprite.borderRadius = 3;
      return sprite;
    },
    [colors.textPrimary]
  );
  const handleBackClick = useCallback(async () => {
    await buildGraph();
    previousClickedNodeRef.current = null;
    setSelectedNode(null);
    const params = new URLSearchParams(location.search);
    params.delete("ministry");
    const newUrl = `${location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  }, [buildGraph]);
  // store previous clicked node id
  const previousClickedNodeRef = useRef(null);

  // Refactored handleNodeClick to use buildGraph for expansion
  const handleNodeClick = useCallback(
    async (node) => {
      setSelectedNode(node);
      if (node?.type === "cabinetMinister" || node?.type === "stateMinister") {
        setNodeLoading(true);
      }

      if (
        (node?.type === "cabinetMinister" || node?.type === "stateMinister") &&
        graphParent &&
        graphParent.id === node.id
      ) {
        await buildGraph();
        previousClickedNodeRef.current = null;
        setSelectedNode(null);
        const params = new URLSearchParams(location.search);
        params.delete("ministry");
        const newUrl = `${location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
        return;
      }

      if (previousClickedNodeRef.current === node?.id) {
        if (node.type === "cabinetMinister" || node?.type === "stateMinister") {
          await buildGraph();
        }
        previousClickedNodeRef.current = null;
        setSelectedNode(null);
        return;
      }

      previousClickedNodeRef.current = node?.id;

      try {
        const distance = 600;
        const transitionMs = 3000;

        const doCameraMove = (n) => {
          if (!focusRef.current) return false;
          if (typeof focusRef.current.cameraPosition !== "function")
            return false;
          const x = typeof n?.x === "number" ? n.x : null;
          const y = typeof n?.y === "number" ? n.y : null;
          const z = typeof n?.z === "number" ? n.z : null;
          if (x === null || y === null || z === null) return false;
          const distRatio = 1 + distance / Math.hypot(x, y, z || 1);
          focusRef.current.cameraPosition(
            { x: x * distRatio, y: y * distRatio, z: z * distRatio },
            n,
            transitionMs
          );
          if (cameraAnimTimeoutRef.current)
            clearTimeout(cameraAnimTimeoutRef.current);
          cameraAnimTimeoutRef.current = setTimeout(() => { }, transitionMs + 2);
          return true;
        };

        let moved = doCameraMove(node);
        if (!moved) {
          let attempts = 0;
          const intervalId = setInterval(() => {
            attempts += 1;
            moved = doCameraMove(node);
            if (moved || attempts >= 20) {
              clearInterval(intervalId);
              if (
                !moved &&
                focusRef.current &&
                typeof focusRef.current.zoomToFit === "function"
              ) {
                focusRef.current.zoomToFit(400, 50);
              }
            }
          }, 50);
        }
      } catch (err) { console.error("Error during node click handling:", err); }

      if (node.type === "cabinetMinister" || node?.type === "stateMinister") {
        const params = new URLSearchParams(location.search);
        params.set("ministry", node.id);
        const newUrl = `${location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
        await buildGraph(node);
      }
    },
    [buildGraph]
  );

  // Configure forces
  useEffect(() => {
    if (
      focusRef.current &&
      graphData.nodes.length > 0 &&
      graphData.links.length > 0 &&
      !loading &&
      focusRef.current.d3Force
    ) {
      requestAnimationFrame(() => {
        try {
          // Ensure the graph is properly initialized before configuring forces
          if (focusRef.current.d3Force) {
            focusRef.current.d3Force("link").distance((link) => {
              switch (link.type) {
                case "level1":
                  return 500;
                case "level2":
                  return 300;
                case "level3":
                  return 500;
                default:
                  return 300;
              }
            });
            focusRef.current.d3Force("charge").theta(0.5).strength(-300);
            setTimeout(() => {
              focusRef.current?.d3ReheatSimulation?.();
            }, 50);
          }
        } catch (e) {
          console.warn("ForceGraph not ready:", e.message);
        }
      });
    }
  }, [graphData.nodes.length, graphData.links.length, loading]);

  useEffect(() => {
    return () => {
      if (focusRef.current) {
        focusRef.current.pauseAnimation();

        const renderer = focusRef.current.renderer();

        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss();
        }

        const scene = focusRef.current.scene();
        if (scene) {
          scene.traverse((object) => {
            if (object.geometry) {
              object.geometry.dispose();
            }
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((material) => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          });
        }
      }
      if (cameraAnimTimeoutRef.current) {
        clearTimeout(cameraAnimTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="flex h-screen w-full relative overflow-hidden">
        <div
          className={`${expandDrawer ? "w-full md:w-1/2 lg:w-2/3" : "w-full"
            } transition-all duration-300 ease-in-out relative`}
          style={{
            backgroundColor: colors.backgroundPrimary,
          }}
        >
          {!loading ? (
            <div
              className="w-full h-full"
              style={{
                backgroundColor: colors.backgroundPrimary,
              }}
            >
              {webgl &&
                (graphData.nodes.length > 0 && graphData.links.length > 0 ? (
                  <div className="relative overflow-hidden">
                    {graphParent && (
                      <button
                        onClick={handleBackClick}
                        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-2 py-2 rounded-sm text-primary/75 bg-foreground/15 transition-all duration-200 hover:cursor-pointer hover:scale-105"
                      >
                        <ArrowLeft size={18} />
                        <span className="font-medium">Back</span>
                      </button>
                    )}

                    {nodeLoading && (
                      <div
                        className="absolute inset-0 z-40 flex items-center justify-center"
                        style={{ pointerEvents: "none" }}
                      >
                        <div
                          className="px-4 py-2 rounded shadow"
                          style={{
                            backgroundColor: colors.backgroundPrimary,
                            color: isDark ? "#fff" : "#000",
                            border: `1px solid ${isDark ? "#333" : "#ddd"}`,
                          }}
                        >
                          Loading...
                        </div>
                      </div>
                    )}

                    <ForceGraph3D
                      showNavInfo={false}
                      height={graphHeight}
                      width={graphWidth}
                      graphData={graphData}
                      backgroundColor={isDark ? "#0d131d" : "#e7e7e7"}
                      linkWidth={3}
                      linkColor={colors.timelineLineActive}
                      nodeRelSize={15}
                      nodeResolution={12}
                      ref={focusRef}
                      rendererConfig={{
                        alpha: true,
                        antialias: false,
                        powerPreference: "low-power",
                        precision: "lowp",
                        failIfMajorPerformanceCaveat: false,
                        preserveDrawingBuffer: false,
                        stencil: false,
                        depth: true,
                        logarithmicDepthBuffer: false,
                      }}
                      onEngineStop={() => focusRef.current.zoomToFit(400, 5)}
                      nodeAutoColorBy="group"
                      nodeThreeObjectExtend={true}
                      nodeThreeObject={getNodeObject}
                      onNodeClick={handleNodeClick}
                      cooldownTicks={100}
                      onNodeDragEnd={(node) => {
                        node.fx = node.x;
                        node.fy = node.y;
                        node.fz = node.z;
                      }}
                    />
                  </div>
                ) : (
                  graphData.nodes.length === 0 &&
                  graphData.links.length === 0 &&
                  !loading && (
                    <div className="flex justify-center items-center w-full h-full">
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                          marginTop: "15px",
                        }}
                      >
                        <Alert
                          severity="info"
                          sx={{ backgroundColor: "transparent" }}
                        >
                          <AlertTitle
                            sx={{
                              fontFamily: "poppins",
                              color: colors.textPrimary,
                            }}
                          >
                            No Search Result
                          </AlertTitle>
                        </Alert>
                      </Box>
                    </div>
                  )
                ))}
            </div>
          ) : (
            <LoadingComponent message="Graph Loading" OsColorMode={false} />
          )}
        </div>

        <Drawer
          expandDrawer={expandDrawer}
          setExpandDrawer={setExpandDrawer}
          selectedNode={selectedNode}
          onMinistryClick={handleNodeClick}
          parentNode={graphParent}
          personDic={personDictionary}
          ministryDic={ministryDictionary}
          departmentDic={departmentDictionary}
          loading={nodeLoading}
        />
      </div>
      <WebGLChecker />
    </>
  );
}
